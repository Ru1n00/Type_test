from django.urls import path
from . import views

app_name = 'type_test'

urlpatterns = [
    path('', views.index, name='home'),
    path('api/test-api', views.test_api, name='test-api'),
    path('api/parse-last-10', views.parse_last_10_tests, name='parse-last-10'),
    path('api/post-score', views.post_score, name='post-score'),
    path('sign-in', views.sign_in, name='sign-in'),
    path('sign-out', views.sign_out, name='sign-out'),
    path('sign-up', views.sign_up, name='sign-up'),
]