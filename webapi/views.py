import requests
import json

from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from . import sudoku_nonsense


# from .models import Greeting

# Create your views here.
# resquest: https://docs.djangoproject.com/en/3.0/ref/request-response/
@csrf_exempt
def index(request):
    r = requests.get('http://httpbin.org/status/418')
    print(r.text)
    print(request.get_host())
    # print(request.body)

    body_unicode = request.body.decode('utf-8')
    body = json.loads(body_unicode)
    content = body['content']

    a = sudoku_nonsense.find_webpage_sudoku(None);
    sudoku_nonsense.get_sudoku_matrix(a)

    return HttpResponse('<pre>' + content + '</pre>')
    # return HttpResponse('Hello from Python!')
    # return render(request, "index.html")

def mock(request, test):
    print(test)
    # query = requests.utils.urlparse(request).query
    # params = dict(x.split('=') for x in query.split('&'))

    #print(params)
    print("request")

    return HttpResponse(request)