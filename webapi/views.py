import requests
import json
import base64
import numpy as np

from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from . import sudoku_nonsense


# from .models import Greeting

# Create your views here.
# resquest: https://docs.djangoproject.com/en/3.0/ref/request-response/
@csrf_exempt
def index(request):
    print(request.get_host())
    
    body_unicode = request.body.decode('utf-8')
    body = json.loads(body_unicode)
    content = body['content']
    print("read content")

    imgdata = base64.b64decode(content)
    jpg_as_np = np.frombuffer(imgdata, dtype=np.uint8)
    print("processed base64 string")

    a = sudoku_nonsense.find_webpage_sudoku(jpg_as_np)
    print("found sudoku")

    result = sudoku_nonsense.get_sudoku_matrix(a)
    print("got matrix")
    print(result)

    string = ""
    for val in result:
        for dig in val:
            string = string + str(int(dig))
        
    print("got string")
    print(string)

    return HttpResponse('<pre>' + string + '</pre>')
    # return HttpResponse('Hello from Python!')
    # return render(request, "index.html")

def mock(request, test):
    print(test)
    # query = requests.utils.urlparse(request).query
    # params = dict(x.split('=') for x in query.split('&'))

    #print(params)
    print("request")

    return HttpResponse(request)