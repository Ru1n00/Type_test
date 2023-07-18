from django.urls import path
from . import views

app_name = 'type_test'

urlpatterns = [
    path('', views.index, name='home'),
]