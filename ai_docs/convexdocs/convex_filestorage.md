# Convex File Storage Reference

## Overview

All file types supported. Files stored in `_storage` system table with metadata.

## Upload Files

**Method 1: Client Upload (2 mutations)**

```typescript
// 1. Generate upload URL
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// 2. Save storage ID to database
export const saveImage = mutation({
  args: {
    storageId: v.id("_storage"),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      body: args.storageId,
      author: args.author,
      format: "image",
    });
  },
});
```

**Client-side:**

```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function UploadForm() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveImage = useMutation(api.files.saveImage);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const file = (e.target as HTMLFormElement).image.files[0];

    // Get upload URL
    const uploadUrl = await generateUploadUrl();

    // Upload file
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();

    // Save to database
    await saveImage({ storageId, author: "User" });
  }
}
```

**Properties:**

- Upload URL expires in 1 hour
- No file size limit, but 2 minute timeout
- Optional sha256 checksum in Digest header
- Returns storage ID: `Id<"_storage">`

**Method 2: HTTP Action**

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/sendImage",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Store file
    const blob = await request.blob();
    const storageId = await ctx.storage.store(blob);

    // Save to database
    const author = new URL(request.url).searchParams.get("author");
    await ctx.runMutation(api.messages.sendImage, { storageId, author });

    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

export default http;
```

## Store Files (Actions)

**From fetched/generated content:**

```typescript
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const generateAndStore = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    // Generate or fetch image
    const imageUrl = "https://...";
    const response = await fetch(imageUrl);
    const image = await response.blob();

    // Store in Convex
    const storageId: Id<"_storage"> = await ctx.storage.store(image);

    // Save to database
    await ctx.runMutation(internal.images.save, {
      storageId,
      prompt: args.prompt,
    });

    return storageId;
  },
});

export const save = internalMutation({
  args: {
    storageId: v.id("_storage"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("images", {
      storageId: args.storageId,
      prompt: args.prompt,
    });
  },
});
```

## Serve Files

**Method 1: URL Generation (Recommended)**

```typescript
import { query } from "./_generated/server";

export const listMessages = query({
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();

    return Promise.all(
      messages.map(async (message) => ({
        ...message,
        ...(message.format === "image"
          ? { url: await ctx.storage.getUrl(message.body) }
          : {}),
      }))
    );
  },
});
```

**Client-side:**

```typescript
function Image({ message }: { message: { url: string } }) {
  return <img src={message.url} height="300px" width="auto" />;
}
```

**Method 2: HTTP Action (for access control)**

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/getImage",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("storageId")! as Id<"_storage">;

    // Access control logic here

    const blob = await ctx.storage.get(storageId);
    if (blob === null) {
      return new Response("Image not found", { status: 404 });
    }

    return new Response(blob);
  }),
});

export default http;
```

**Limit:** HTTP action response max 20MB

**Client-side:**

```typescript
const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL;

function Image({ storageId }: { storageId: string }) {
  return (
    <img
      src={`${convexSiteUrl}/getImage?storageId=${storageId}`}
      height="300px"
    />
  );
}
```

## Delete Files

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});
```

**Notes:**

- After deletion, URLs return 404
- Available in mutations, actions, HTTP actions

## File Metadata

**From Queries/Mutations:**

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getMetadata = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.storageId);
  },
});

export const listAllFiles = query({
  handler: async (ctx) => {
    return await ctx.db.system.query("_storage").collect();
    // Can also use .paginate()
  },
});
```

**Metadata Format:**

```typescript
{
  "_id": "3k7ty84apk2zy00ay4st1n5p9kh7tf8",
  "_creationTime": 1700697415295.742,
  "contentType": "image/jpeg",
  "size": 125338,
  "sha256": "cb58f529b2ed5a1b8b6681d91126265e919ac61fff6a367b8341c0f46b06a5bd"
}
```

**From Actions (deprecated, use db.system.get):**

```typescript
const metadata = await ctx.storage.getMetadata(storageId);
```

## Storage API Reference

### Mutations

```typescript
ctx.storage.generateUploadUrl(): Promise<string>
// Returns upload URL, expires in 1 hour

ctx.storage.getUrl(storageId: Id<"_storage">): Promise<string | null>
// Returns file URL or null

ctx.storage.delete(storageId: Id<"_storage">): Promise<void>
// Deletes file
```

### Actions

```typescript
ctx.storage.store(blob: Blob): Promise<Id<"_storage">>
// Stores blob, returns storage ID

ctx.storage.get(storageId: Id<"_storage">): Promise<Blob | null>
// Gets file blob or null

ctx.storage.getUrl(storageId: Id<"_storage">): Promise<string | null>
// Returns file URL or null

ctx.storage.delete(storageId: Id<"_storage">): Promise<void>
// Deletes file
```

### Queries

```typescript
ctx.storage.getUrl(storageId: Id<"_storage">): Promise<string | null>
// Returns file URL or null (read-only)
```

## Type Validation

```typescript
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Validator
v.id("_storage");

// TypeScript type
Id<"_storage">;
```

## Dashboard Management

Access stored files at: Dashboard → File Storage

Features:

- View all files
- Download files
- Delete files
- View metadata

## Upload Patterns

**Pattern 1: Client Direct Upload**

```
Client → generateUploadUrl() → Upload URL
Client → POST to Upload URL → Storage ID
Client → saveFile(storageId) → Database
```

**Pattern 2: HTTP Action**

```
Client → POST to HTTP Action → storage.store()
HTTP Action → runMutation() → Database
```

**Pattern 3: Action (generated/fetched)**

```
Action → fetch() → Blob
Action → storage.store() → Storage ID
Action → runMutation() → Database
```

## Serving Patterns

**Pattern 1: Pre-signed URLs (Recommended)**

- Call `storage.getUrl()` in query/mutation
- Return URLs with data
- Best for general use

**Pattern 2: HTTP Action**

- Access control at serve time
- Max 20MB response
- Use for protected files

## Best Practices

- Store `Id<"_storage">` in database documents
- Use `v.id("_storage")` validator for arguments
- Generate upload URLs just before upload (1hr expiry)
- Delete unused files to save storage
- Use HTTP actions for files requiring access control
- Use URL generation for public/semi-public files
- Check metadata via `_storage` system table

## Limits

- Upload timeout: 2 minutes
- HTTP action response: 20MB max
- Upload URL expiry: 1 hour
- No file size limit for storage

---

**Source:** https://docs.convex.dev/file-storage
