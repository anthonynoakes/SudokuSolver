import cv2
import pytesseract
import numpy as np
import matplotlib.pyplot as plt

# pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
pytesseract.pytesseract.tesseract_cmd = '/app/.apt/usr/bin/tesseract'

def get_sudoku_matrix(src):
    if type(src) == str:
        puz = cv2.imread(src)
    else:
        puz = cv2.resize(src, (1220,1220))
    puz = cv2.copyMakeBorder(puz, 10, 10, 10, 10, cv2.BORDER_CONSTANT, value=(0,0,0));
    puz = cv2.copyMakeBorder(puz, 10, 10, 10, 10, cv2.BORDER_CONSTANT, value=(255,255,255));

    gray = cv2.cvtColor(puz, cv2.COLOR_BGR2GRAY)

    #plt.imshow(puz)
    cons = get_contours(gray)
    cs = sorted(cons, key=cv2.contourArea)

    pw, ph, sw, sh = get_puzzle_metrics(cs[-1])
    #print(pw,ph,sw,sh)
    num_cons = []
    concat = np.ones((75,50))
    i = 1
    matrix = np.zeros((9,9))

    for c in cons: 
        #print(i)
        x,y,w,h = cv2.boundingRect(c)
        #print(cv2.contourArea(c))
        #if cv2.contourArea(c) < 20000 and cv2.contourArea(c) > 800:
        if w*h < 10000 and w*h > 1000 and w > 15 and h > 50:

            col = int(np.floor((x+w/2) / sw))
            row = int(np.floor((y+h/2) / sh))
            #print(x,y,col,row)
            matrix[row][col] = int(i)
            num_img = gray[y:y+h, x:x+w]
            #cv2.imwrite(str(x) +' '+ str(y) + '.jpg', num_img)
            #cv2.drawContours(puz, c, -1, (0,255,0), 2)


            num_cons.append(c)

            num_img = cv2.resize(num_img, (50,75))
            concat = np.concatenate((concat, num_img), axis=1)
            i += 1
            #text = pytesseract.image_to_string(final)
            #print("number " + str(i) + ' ', text)


    num_string = get_numbers_string(concat)
    #print(num_string)
    num_dict = make_dictionary(num_string)
    final_matrix = create_matrix(matrix, num_dict)
    # plt.imshow(puz)

    string = ""
    for val in final_matrix:
        for dig in val:
            string = string + str(int(dig))

    return string


# In[44]:


def get_contours(gray):
    
    __, th = cv2.threshold(gray, 100, 255, 0)
    contours = cv2.findContours(th, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)[-2]


    return contours


# In[5]:


def get_puzzle_metrics(con):    
    rec = cv2.boundingRect(con)

    puz_width = rec[2]
    puz_height = rec[3]
    sq_width = puz_width / 9
    sq_height = puz_height / 9
    return puz_width, puz_height, sq_width, sq_height


# In[167]:


def get_numbers_string(num_img):
    final = cv2.copyMakeBorder(num_img, 50, 50, 50, 50, cv2.BORDER_CONSTANT, value=(255,255,255));
    la = cv2.resize(final, (0,0), fx=.5, fy=.5)
    text = pytesseract.image_to_string(la)
    return text


# In[7]:


def make_dictionary(text):
    num_dict = {}
    i = 0
    for char in text:
        if i > 0:
            if char == ' ':
                i = i - 1
            else:
                num_dict[i] = char
        i += 1
    return num_dict


# In[8]:


def create_matrix(matrix, numdict):
    final_matrix = np.zeros((9,9))
    for i in range(matrix.shape[0]):
        for j in range(matrix.shape[1]):
            if matrix[i][j] > 0:
                final_matrix[i][j] = numdict[int(matrix[i][j])]
    return final_matrix

def find_webpage_sudoku(src):

    
    page = cv2.imdecode(src, flags=1)

    # page = src

    gray = cv2.cvtColor(page,cv2.COLOR_BGR2GRAY)
    __, th = cv2.threshold(gray,215,255,0)
    ker = np.ones((5,5))

    #th = cv2.dilate(th, ker, iterations=5)
    plt.imshow(th)
    # Create the images that will use to extract the horizontal and vertical lines
    horizontal = np.copy(th)
    vertical = np.copy(th)

    cols = horizontal.shape[1]
    horizontal_size = cols // 3
    # Create structure element for extracting horizontal lines through morphology operations
    horizontalStructure = cv2.getStructuringElement(cv2.MORPH_RECT, (horizontal_size, 1))
    # Apply morphology operations
    horizontal = cv2.erode(horizontal, horizontalStructure)
    horizontal = cv2.dilate(horizontal, horizontalStructure)

    rows = vertical.shape[0]
    verticalsize = rows // 3
    # Create structure element for extracting vertical lines through morphology operations
    verticalStructure = cv2.getStructuringElement(cv2.MORPH_RECT, (1, verticalsize))
    # Apply morphology operations
    vertical = cv2.erode(vertical, verticalStructure)
    vertical = cv2.dilate(vertical, verticalStructure)

    vertical = cv2.bitwise_not(vertical)

    # Step 1
    edges = cv2.adaptiveThreshold(vertical, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 3, -2)
    # Step 2
    kernel = np.ones((2, 2), np.uint8)
    edges = cv2.dilate(edges, kernel)
    # Step 3
    smooth = np.copy(vertical)
    # Step 4
    smooth = cv2.blur(smooth, (2, 2))
    # Step 5
    (rows, cols) = np.where(edges != 0)
    vertical[rows, cols] = smooth[rows, cols]
    
    added = cv2.bitwise_and(cv2.bitwise_not(horizontal), vertical)
    plt.imshow(added)
    ker = np.ones((5,5))
    di = cv2.erode(added, ker, iterations=10)
    er = cv2.dilate(di, ker, iterations=16)
    
    contours = cv2.findContours(er, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)[-2]
    cs = sorted(contours, key=cv2.contourArea)
    for c in cs:
        x,y,w,h = cv2.boundingRect(c)
        if w < page.shape[0]:
            width = min(w,h)
            cropped = page[y:y+width, x:x+width]

    plt.imshow(cropped)
    #cv2.imwrite('webresult.jpg', cropped)
    return cropped
