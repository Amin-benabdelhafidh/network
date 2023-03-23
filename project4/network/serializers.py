from rest_framework import serializers
from .models import * 

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'followings', "followers"]


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'user', 'username','commented_at', 'content']

class PostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = Post
        fields = ['id', 'username', 'user' ,'content', 'publish_time', 'likes']