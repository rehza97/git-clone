# Fix CORS for Firebase Storage (file viewer)

When opening a file on the repo page, the browser may block the request with:

```
Access to fetch at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

Apply CORS to your Storage bucket so the app can fetch file contents from the browser.

## 1. Get your bucket name

- Open [Firebase Console](https://console.firebase.google.com) → your project → **Storage**.
- The bucket name is shown at the top (e.g. `github-clone-1aee4.firebasestorage.app` or `github-clone-1aee4.appspot.com`).

## 2. Apply CORS

From the project root (where `storage.cors.json` lives):

**Using gcloud (recommended):**

```bash
gcloud storage buckets update gs://YOUR_BUCKET_NAME --cors-file=storage.cors.json
```

**Using gsutil (legacy):**

```bash
gsutil cors set storage.cors.json gs://YOUR_BUCKET_NAME
```

Replace `YOUR_BUCKET_NAME` with your actual bucket (e.g. `github-clone-1aee4.firebasestorage.app`).

## 3. Requirements

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed (`gcloud` or `gsutil`).
- Logged in: `gcloud auth login`.
- Project set: `gcloud config set project github-clone-1aee4`.
- Permissions: you need Storage Admin (or equivalent) on the bucket.

## 4. Add more origins

To allow another origin (e.g. a custom domain), add it to the `"origin"` array in `storage.cors.json`, then run the same `gcloud`/`gsutil` command again.
