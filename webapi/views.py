import requests

from django.shortcuts import render
from django.http import HttpResponse

# from .models import Greeting

# Create your views here.
def index(request):
    r = requests.get('http://httpbin.org/status/418')
    print(r.text)
    return HttpResponse('<pre>' + r.text + '</pre>')
    # return HttpResponse('Hello from Python!')
    # return render(request, "index.html")
