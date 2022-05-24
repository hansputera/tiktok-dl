---
description: This page give an information how to use the API correctly.
---

# 🤔 How to use?

First, you need to know the Base URL of the TikTok-DL Rest API.

{% hint style="info" %}
Example: `https://tdl.besecure.eu.org`
{% endhint %}

Great! You're ready to use.

### :satellite: Endpoints

Currently, we only have 3 endpoints in the TikTok-DL Rest API v1.0.4.

{% swagger method="get" path="api/download" baseUrl="https://tdl.besecure.eu.org/" summary="Getting TikTok's video download urls with search params." %}
{% swagger-description %}
This endpoint will return download URLs without watermark and watermark.
{% endswagger-description %}

{% swagger-parameter in="query" name="url" type="URL" required="true" %}
TikTok's Video URL (e.g. 

[https://www.tiktok.com/@raphaeltangg/video/7027045794377190658](https://www.tiktok.com/@raphaeltangg/video/7027045794377190658)

)
{% endswagger-parameter %}

{% swagger-parameter in="query" name="nocache" type="String" %}
If you want disable the response cache.
{% endswagger-parameter %}

{% swagger-parameter in="query" name="type" type="Provider" %}
Default to random provider
{% endswagger-parameter %}

{% swagger-parameter in="query" name="rotateOnError" type="String" %}
Rotate provider when an error is returned.
{% endswagger-parameter %}

{% swagger-response status="200: OK" description="The video result is available" %}
```javascript
{
    "result": {
        "urls": ["tiktok video url", ...more],
        "thumb": "video thumbnail url if any",
        "additional": { // if any
            "musicUrl": "video music url if any"
        }
    }
}
```
{% endswagger-response %}

{% swagger-response status="400: Bad Request" description="Something was wrong with your request payload." %}
```javascript
{
    "error": "An error message here"
}
```
{% endswagger-response %}

{% swagger-response status="500: Internal Server Error" description="You should check server logs or open an issue." %}
```javascript
```
{% endswagger-response %}
{% endswagger %}

{% swagger method="post" path="api/download" baseUrl="https://tdl.besecure.eu.org/" summary="Getting TikTok's video download urls with body." %}
{% swagger-description %}
This endpoint will return download URLs without watermark and watermark.
{% endswagger-description %}

{% swagger-parameter in="body" name="url" type="URL" required="true" %}
TikTok's Video URL (e.g. 

[https://www.tiktok.com/@raphaeltangg/video/7027045794377190658](https://www.tiktok.com/@raphaeltangg/video/7027045794377190658)

)
{% endswagger-parameter %}

{% swagger-parameter in="body" name="nocache" type="Boolean" %}
If you want disable the response cache.
{% endswagger-parameter %}

{% swagger-parameter in="body" name="type" type="Provider" %}
Default to random provider
{% endswagger-parameter %}

{% swagger-parameter in="body" name="rotateOnError" type="Boolean" %}
Rotate provider when an error is returned.
{% endswagger-parameter %}

{% swagger-response status="200: OK" description="The video result is available" %}
```javascript
{
    "result": {
        "urls": ["tiktok video url", ...more],
        "thumb": "video thumbnail url if any",
        "additional": { // if any
            "musicUrl": "video music url if any"
        }
    }
}
```
{% endswagger-response %}

{% swagger-response status="400: Bad Request" description="Something was wrong with your request payload." %}
```javascript
{
    "error": "An error message here"
}
```
{% endswagger-response %}

{% swagger-response status="500: Internal Server Error" description="You should check server logs or open an issue." %}
```javascript
{
    // Response
}
```
{% endswagger-response %}
{% endswagger %}

{% swagger method="get" path="api/stored-links" baseUrl="https://tdl.besecure.eu.org/" summary="Getting cached TikTok's video URL." %}
{% swagger-description %}

{% endswagger-description %}

{% swagger-response status="200: OK" description="It will return an array includes TikTok's video URL or an empty array." %}
```javascript
["https://vm.tiktok.com/....", ...more];
```
{% endswagger-response %}
{% endswagger %}

{% swagger method="get" path="api/providers" baseUrl="https://tdl.besecure.eu.org/" summary="Getting all provider status." %}
{% swagger-description %}

{% endswagger-description %}

{% swagger-response status="200: OK" description="Provider list." %}
```javascript
[
    {
        "name": "TikTok Provider name",
        "url": "https://site.com",
        "maintenance": {
            "reason": "Maintenance reason"
        },
        "params": [],
    }, {
        "name": "TikTok Provider name",
        "url": "https://site.com",
        "params": [{
            "name": "something",
            "type": "string"
        }]
    }
]
```
{% endswagger-response %}
{% endswagger %}

### :fire: HELP WANTED

I need more TikTok downloader websites where it could be a provider of this project, you could create an issue if you know about that. And, I need someone want contribute to this project :duck:
