---
description: Describe response schema.
---

# 😉 Response Schema

```typescript
{
    error?: string;
    video?: {
        id?: string;
        thumb?: string;
        urls: string[];
        title?: string;
        duration?: string;
    };
    music?: {
        url: string;
        title?: string;
        author?: string;
        id?: string;
        cover?: string;
    };
    author?: {
        username?: string;
        thumb?: string;
        id?: string;
    };
    caption?: string;
    playsCount?: number;
    sharesCount?: number;
    commentsCount?: number;
    likesCount?: number;
    uploadedAt?: string;
    updatedAt?: string;
};
```

`?:` means it could doesn't exist / optional.
