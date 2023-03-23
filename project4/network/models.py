from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        related_name="follower",
        )
    followings = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        related_name="following",
        )
    def __str__(self):
        return f'{self.username}'



class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE ,related_name='poster')
    content = models.TextField()
    publish_time = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User , default=None)

    def __str__(self):
        return f'post id of:{self.id} posted by:{self.user}'


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE ,related_name='commenter')
    commented_at = models.DateTimeField(auto_now_add=True)
    commented_on = models.ForeignKey(Post, on_delete=models.CASCADE ,related_name='commented_post')
    content = models.TextField()

    def __str__(self):
        return f'{self.user} on {self.commented_on}'
