import fetch from 'node-fetch'
import fs from 'fs/promises'

export interface Repo {
  owner: string
  repo: string
}

export interface Issue {
  id: number,
  url: string,
  number: number,
  title: string,
  body: string,
  comments: Comment[],
  created_at: string,
  updated_at: string
}

export class GitHubRepo {
  private owner: string
  private repo: string
  constructor({owner, repo}: Repo) {
    this.owner = owner
    this.repo = repo
  }

  private async issuePage(page: number): Promise<Issue[]> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/issues?page=${page}&state=open&per_page=100`

    const res = await fetch(url)
    const body = await res.json()
    const issues = body as Issue[]
    return issues
  }

  async issues(): Promise<Issue[]> {
    const file = `${this.owner}-${this.repo}.json`
    try {
      const stat = await fs.stat(file)
      if (!stat.isFile()) throw new Error('no cache')
      return JSON.parse((await fs.readFile(file)).toString()) as Issue[]
    } catch (err) {
      let page = 1
      let issues: Issue[] = []
      for (; ;) {
        const issuePage = await this.issuePage(page)
        if (issuePage.length === 0) break
        issues = [...issues, ...issuePage]
        page++
      }
      fs.writeFile(file, JSON.stringify(issues))
      return issues
    }
  }
}
