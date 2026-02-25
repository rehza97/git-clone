# ASCAP Public API

Base URL (when deployed): `https://<region>-<project>.cloudfunctions.net/api` or your configured API domain.

## Authentication

For **private** repositories, send the Firebase ID token in the request:

```
Authorization: Bearer <Firebase Id Token>
```

Obtain the token on the client via `firebase.auth().currentUser.getIdToken()`.

Public repositories can be read without authentication.

---

## Endpoints

### GET /api/repos

List public repositories.

**Query parameters:**

| Parameter   | Type   | Description                    |
|------------|--------|--------------------------------|
| visibility | string | `public` (default)             |
| ownerId    | string | Filter by owner UID (optional) |
| limit      | number | Max results (default 20)       |
| orderBy    | string | `createdAt` (default)          |

**Response:** `200` JSON array of repository objects.

---

### GET /api/repos/:repoId

Get a single repository's metadata.

**Response:** `200` repository object, or `404` if not found or not accessible.

For private repos, requires `Authorization: Bearer <token>` (owner).

---

### GET /api/repos/:repoId/files

List file paths (and metadata) for a repository.

**Response:** `200` JSON array of file path/metadata objects, or `404` if repo not found/accessible.

---

### GET /api/repos/:repoId/files/content

Get file content by path.

**Query parameters:**

| Parameter | Type   | Description        |
|-----------|--------|--------------------|
| path      | string | File path in repo  |

**Response:** `200` with file content (or redirect to signed URL for large files), or `404`.

---

## Implementation

Implemented via **Firebase Cloud Functions** (Node/TypeScript) in the `functions/` directory. Deploy with:

```bash
firebase deploy --only functions
```

See `functions/src/index.ts` for the HTTP handlers.
