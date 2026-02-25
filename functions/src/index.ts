import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

admin.initializeApp()

const db = admin.firestore()

// GET /api/repos — list public repos
export const apiRepos = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }
  try {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100)
    const snap = await db.collection("repos")
      .where("visibility", "==", "public")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()
    const repos = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    res.set("Access-Control-Allow-Origin", "*").status(200).json(repos)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/repos/:repoId — get one repo
export const apiRepo = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }
  const repoId = req.path.split("/").pop()
  if (!repoId) {
    res.status(400).json({ error: "Missing repoId" })
    return
  }
  try {
    const doc = await db.collection("repos").doc(repoId).get()
    if (!doc.exists) {
      res.status(404).json({ error: "Not found" })
      return
    }
    const data = doc.data()!
    if (data.visibility === "private") {
      const auth = req.headers.authorization
      if (!auth?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" })
        return
      }
      // In production, verify Firebase ID token and check uid === data.ownerId
    }
    res.set("Access-Control-Allow-Origin", "*").status(200).json({ id: doc.id, ...data })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Internal server error" })
  }
})
