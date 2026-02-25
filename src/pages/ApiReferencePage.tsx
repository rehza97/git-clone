import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Code2, Copy, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const API_VERSION = "v1.2.0"

const endpoints = [
  {
    method: "POST",
    path: "/v1/projects",
    title: "Create a Project",
    description:
      "This endpoint initiates the archiving process for a new software project. It accepts metadata about the project and returns a unique project ID along with an upload URL for the source code archive.",
    params: [
      { name: "name", type: "string", desc: "The official name of the project.", required: true },
      { name: "version", type: "string", desc: "Semantic versioning (e.g., 1.0.0).", required: false },
      { name: "contributors", type: "array", desc: "List of researcher IDs or emails.", required: false },
      { name: "license", type: "string", desc: "SPDX license identifier (e.g., MIT, Apache-2.0).", required: false },
    ],
    request: `curl -X POST https://api.ascap.dz/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "AI Traffic Control System",
    "version": "1.0.0",
    "description": "An AI model for optimizing traffic flow in Algiers.",
    "license": "MIT",
    "contributors": ["researcher_12345", "researcher_67890"],
    "tags": ["AI", "Smart City", "Transport"]
  }'`,
    response: `{
  "id": "proj_8923fd2",
  "status": "pending_upload",
  "upload_url": "https://storage.ascap.dz/upload/v1/signed/...",
  "expires_at": "2023-10-25T14:30:00Z",
  "created_at": "2023-10-25T13:30:00Z"
}`,
  },
  {
    method: "GET",
    path: "/v1/projects/{id}/certificate",
    title: "Download Certificate",
    description:
      "Retrieve the official PDF certificate of deposit for an archived project. This document serves as proof of registration for academic defenses.",
    pathParams: [{ name: "id", type: "string", desc: "The unique identifier of the project." }],
    request: `curl -X GET https://api.ascap.dz/v1/projects/proj_8923fd2/certificate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -o certificate.pdf`,
    responseType: "Binary PDF data stream",
  },
  {
    method: "GET",
    path: "/v1/search",
    title: "Search Archive",
    description:
      "Search the public archive for projects. Useful for discovering existing solutions and verifying project uniqueness.",
    queryParams: [
      { name: "q", type: "string", desc: "The search query." },
      { name: "university", type: "string", desc: "Filter by university affiliation." },
      { name: "year", type: "integer", desc: "Filter by academic year." },
    ],
    request: `import requests
response = requests.get(
    "https://api.ascap.dz/v1/search",
    params={"q": "machine learning", "university": "USTHB"},
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
print(response.json())`,
    response: `{
  "count": 14,
  "results": [
    {
      "id": "proj_123",
      "name": "ML for Image Proc",
      "author": "Yacine K."
    }
  ]
}`,
  },
] as const

const navSections = [
  {
    title: "api.gettingStarted",
    links: [
      { href: "#intro", label: "api.introduction" },
      { href: "#auth", label: "api.authentication" },
      { href: "#errors", label: "api.errors" },
      { href: "#rateLimits", label: "api.rateLimits" },
    ],
  },
  {
    title: "api.projects",
    links: [
      { href: "#create-project", label: "api.createProject" },
      { href: "#list-projects", label: "api.listProjects" },
      { href: "#get-project", label: "api.getProjectDetails" },
      { href: "#update-project", label: "api.updateProject" },
    ],
  },
  {
    title: "api.certificates",
    links: [
      { href: "#request-certificate", label: "api.requestCertificate" },
      { href: "#verify-certificate", label: "api.verifyCertificate" },
    ],
  },
]

function CodeBlock({ children, label }: { children: string; label?: string }) {
  const copy = () => navigator.clipboard.writeText(children)
  return (
    <div className="rounded-lg border border-border bg-[#0d1117] overflow-hidden">
      {label && (
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/30 px-4 py-2">
          <span className="text-xs font-mono text-slate-500">{label}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-white" onClick={copy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-slate-300">
        <code className="whitespace-pre">{children}</code>
      </pre>
    </div>
  )
}

export function ApiReferencePage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-1 overflow-hidden">
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border bg-card lg:block">
        <div className="p-6">
          <nav className="space-y-8">
            {navSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(section.title)}
                </h3>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {t(link.label)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px]">
          <div className="border-b border-border px-6 py-8 lg:px-12">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded bg-primary/20 text-primary">
                <Code2 className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                ASCAP <span className="font-normal text-muted-foreground">API</span>
              </h1>
              <Badge variant="secondary" className="font-mono text-xs">
                {API_VERSION}
              </Badge>
            </div>
            <p className="mt-4 text-muted-foreground">
              {t("api.description")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  {t("nav.dashboard")}
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="outline" size="sm">
                  {t("nav.docs")}
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="outline" size="sm">
                  {t("nav.support")}
                </Button>
              </Link>
            </div>
          </div>

          {endpoints.map((ep, i) => (
            <section
              key={ep.path}
              id={ep.path.replace(/\//g, "-").replace(/{|}/g, "")}
              className="flex flex-col border-b border-border xl:flex-row"
            >
              <div className="flex-1 p-8 lg:p-12 xl:max-w-2xl">
                <div className="mb-4 flex items-center gap-2">
                  <Badge
                    variant={ep.method === "POST" ? "default" : "secondary"}
                    className={
                      ep.method === "POST"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-600/10 text-blue-700 dark:text-blue-400"
                    }
                  >
                    {ep.method}
                  </Badge>
                  <code className="font-mono text-sm text-muted-foreground">{ep.path}</code>
                </div>
                <h2 className="mb-4 text-2xl font-bold">{ep.title}</h2>
                <p className="mb-6 leading-relaxed text-muted-foreground">{ep.description}</p>
                {i === 0 && (
                  <div className="mb-8 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
                    <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h5 className="mb-1 text-sm font-bold text-blue-800 dark:text-blue-300">
                        {t("api.complianceNote")}
                      </h5>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        {t("api.complianceNoteDesc")}
                      </p>
                    </div>
                  </div>
                )}
                {"params" in ep && ep.params && (
                  <>
                    <h3 className="mb-4 text-lg font-bold">{t("api.requestBody")}</h3>
                    <div className="overflow-hidden rounded-lg border border-border">
                      <table className="min-w-full divide-y divide-border text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {t("api.parameter")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {t("api.type")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {t("api.description")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                          {ep.params.map((p) => (
                            <tr key={p.name}>
                              <td className="px-6 py-4 font-mono font-medium text-primary">{p.name}</td>
                              <td className="px-6 py-4 text-muted-foreground">{p.type}</td>
                              <td className="px-6 py-4 text-muted-foreground">
                                {p.desc} {p.required && <span className="text-destructive">*Required</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                {"pathParams" in ep && ep.pathParams && (
                  <>
                    <h3 className="mb-4 text-lg font-bold">{t("api.pathParameters")}</h3>
                    <div className="mb-6 overflow-hidden rounded-lg border border-border">
                      <table className="min-w-full divide-y divide-border text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {t("api.parameter")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {t("api.type")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {t("api.description")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                          {ep.pathParams.map((p) => (
                            <tr key={p.name}>
                              <td className="px-6 py-4 font-mono font-medium text-primary">{p.name}</td>
                              <td className="px-6 py-4 text-muted-foreground">{p.type}</td>
                              <td className="px-6 py-4 text-muted-foreground">{p.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                {"queryParams" in ep && ep.queryParams && (
                  <>
                    <h3 className="mb-4 text-lg font-bold">{t("api.queryParameters")}</h3>
                    <ul className="mb-6 ml-4 list-disc space-y-2 text-sm text-muted-foreground">
                      {ep.queryParams.map((p) => (
                        <li key={p.name}>
                          <code className="rounded bg-muted px-1 font-mono text-primary">{p.name}</code> ({p.type}
                          ): {p.desc}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div className="min-w-0 flex-1 border-l border-border bg-[#0d1117]">
                <div className="sticky top-0 p-4 lg:p-6">
                  <CodeBlock label={t("api.request")}>{ep.request}</CodeBlock>
                  <div className="mt-6">
                    {"responseType" in ep && ep.responseType ? (
                      <div className="rounded-lg border border-border bg-[#0d1117] p-4">
                        <div className="mb-2 text-xs font-mono text-slate-500">
                          Response (200 OK)
                        </div>
                        <p className="font-mono text-sm italic text-slate-400">
                          &lt; {ep.responseType} &gt;
                        </p>
                      </div>
                    ) : (
                      "response" in ep &&
                      ep.response && (
                        <CodeBlock
                          label={
                            ep.method === "POST"
                              ? "Response (201 Created)"
                              : "Response (200 OK)"
                          }
                        >
                          {ep.response}
                        </CodeBlock>
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>
          ))}

          <footer className="border-t border-border p-8 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} ASCAP.{" "}
              <Link to="/about" className="text-primary hover:underline">
                {t("nav.about")}
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
