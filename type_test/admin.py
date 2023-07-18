from django.contrib import admin
from .models import Profile, Test, CompletedTest

# Register your models here.
class TestAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'author', 'added_by', 'created', 'updated')

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'name', 'email', 'avg_speed', 'avg_accuracy', 'match_played', 'created', 'updated')

class CompletedTestAdmin(admin.ModelAdmin):
    list_display = ('id', 'played_by', 'test', 'speed', 'accuracy', 'created', 'updated')


admin.site.register(Profile, ProfileAdmin)
admin.site.register(Test, TestAdmin)
admin.site.register(CompletedTest, CompletedTestAdmin)