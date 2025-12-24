import fetch from "node-fetch";

const GITHUB_API = "https://api.github.com";

type CreateIssueInput = {
  title: string;
  body: string;
};

export class GitHubAdapter {
  constructor(
    private token: string,
    private owner: string,
    private repo: string,
  ) {}

  async createIssue(input: CreateIssueInput): Promise<{ url: string }> {
    const res = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          title: input.title,
          body: input.body,
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub issue creation failed (${res.status}): ${text}`);
    }

    const json: any = await res.json();
    return { url: json.html_url };
  }
}
