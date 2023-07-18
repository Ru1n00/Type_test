from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    email = models.EmailField()
    image = models.ImageField(null=True, blank=True, upload_to='profile/images')
    avg_speed = models.DecimalField(decimal_places=2, max_digits=5, default=0.00)
    avg_accuracy = models.DecimalField(decimal_places=2, max_digits=5, default=0.00)
    match_played = models.IntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    

class Test(models.Model):
    name = models.CharField(max_length=50)
    author = models.CharField(max_length=50)
    added_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True)
    text_field = models.TextField(max_length=1000)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    

class CompletedTest(models.Model):
    played_by = models.ForeignKey(Profile, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    speed = models.DecimalField(decimal_places=2, max_digits=5, default=0.00)
    accuracy = models.DecimalField(decimal_places=2, max_digits=5, default=0.00)

    class Meta:
        verbose_name_plural = 'Completed Tests'
        ordering = ['-id']