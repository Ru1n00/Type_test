from django.shortcuts import render, redirect, HttpResponse
from django.http.response import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import  password_validation

from .models import Test, CompletedTest, Profile
from .forms import SignUpForm

import random
import json
from decimal import Decimal


def index(request):
    return render(request, 'type_test/index.html')


# api to get new tesst 
def get_test(request):
    if request.method == 'POST' or request.method == "GET":
        tests_count = Test.objects.count()
        while True:
            try:
                test = Test.objects.get(id=random.randint(1, tests_count))
                break
            except:
                pass

        
        context = {
            'name': test.name,
            'text_field': test.text_field,
            'test_id': test.id
        }

        # checking if there is an author of a quote
        if test.author:
            context['author'] = test.author
        return JsonResponse(context, safe=False)
    return JsonResponse('Sorry', safe=False)


@login_required(login_url = 'type_test:sign-in')
def parse_last_10_tests(request):
    # checking whether the user is authenticated and have a profile or not
    context = {}
    if request.user.is_authenticated:
        try:
            profile = request.user.profile
            latest_10 = CompletedTest.objects.filter(played_by=profile)[:10]
            latest_10_accuracy = []
            latest_10_speed = []
            for i in latest_10:
                latest_10_accuracy.append(float(i.accuracy))
                latest_10_speed.append(float(i.speed))
            context['accuracy_list'] = latest_10_accuracy
            context['speed_list'] = latest_10_speed
            print(latest_10_accuracy, latest_10_speed)

            return JsonResponse(context, safe=False)

        except:
            print('no profile for user')

    return JsonResponse('User has no profile', safe=False)


# api for posting scores after completing typing test
@login_required(login_url = 'type_test:sign-in')
def post_score(request):
    if not request.user.is_authenticated:
        return JsonResponse('user not logged in :)', safe=False)

    try:
        played_by = Profile.objects.get(user=request.user)
    except:
        return JsonResponse('User has no type test profile :)', safe=False)

    if request.method == 'POST':
        body = request.body
        body = json.loads(body)

        # request body must have speed, accuracy and test_id
        if body['speed'] != None and body['accuracy'] != None:
            # played_by = request.user.profile
            played_by.match_played += 1
            played_by.avg_speed = (played_by.avg_speed * (played_by.match_played-1) + Decimal(body['speed'])) / played_by.match_played
            played_by.avg_accuracy = (played_by.avg_accuracy * (played_by.match_played-1) + Decimal(body['accuracy'])) / played_by.match_played
            played_by.save()
            test = body['test_id']
            test = Test.objects.get(id=test)
            speed = body['speed']
            accuracy = body['accuracy']
            print(played_by, test, speed, accuracy)
            CompletedTest.objects.create(played_by=played_by, test=test, speed=speed, accuracy=accuracy)
        return JsonResponse('ok posted successfully :)', safe=False)

    
# sign up view
def sign_up(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST, request.FILES or None)

        if form.is_valid():
            username = form.cleaned_data.get('username')
            name = form.cleaned_data.get('name')
            email = form.cleaned_data.get('email')
            image = form.files.get('image')
            password1 = form.cleaned_data.get('password1')
            password2 = form.cleaned_data.get('password2')
            if password1 != password2:
                # return HttpResponse('passwords do not match')
                messages.error(request, 'passwords do not match')
                return render(request, 'type_test/signup.html', {'form':form})
            try:
                password_validation.validate_password(password1)
            except:
                # return HttpResponse('password is too weak')
                messages.error(request, 'password is too weak')
                return render(request, 'type_test/signup.html', {'form':form})

            try:
                user = User.objects.create_user(username=username, email=email, password=password1)
            except:
                # return HttpResponse('username already exists')
                messages.error(request, 'username already exists')
                return render(request, 'type_test/signup.html', {'form':form})
            user.save()

            profile = Profile.objects.create(user=user, name=name, email=email, image=image)

            if user != None:
                login(request, user)
                return redirect('type_test:home')
            return HttpResponse('signed up')
    
    form = SignUpForm()
    return render(request, 'type_test/signup.html', {'form':form})


# log in view
def sign_in(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, request.POST)

        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user != None:
                login(request, user)
                return redirect('type_test:home')
            return HttpResponse('signed in')

    form = AuthenticationForm()
    return render(request, 'type_test/login.html', {'form':form})


# log out
def sign_out(request):
    logout(request)
    return redirect('type_test:home')