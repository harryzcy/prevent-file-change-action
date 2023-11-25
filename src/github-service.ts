import * as core from '@actions/core'
import {getOctokit} from '@actions/github'

export interface IFile {
  filename: string
}

export default class GitHubService {
  private readonly octokit

  constructor(gitHubToken: string) {
    this.octokit = getOctokit(gitHubToken)
  }

  async getChangedFilesForCommits(repositoryOwner: string, repositoryName: string, basehead: string): Promise<IFile[]> {
    const responseBody = await this.octokit.paginate(this.octokit.rest.repos.compareCommitsWithBasehead, {
      owner: repositoryOwner,
      repo: repositoryName,
      basehead
    })

    const files: IFile[] =
      responseBody.files?.map(file => {
        return {filename: file.filename} as IFile
      }) || []

    core.debug(`Commits ${basehead} includes following files: ${JSON.stringify(files)}`)

    return files
  }

  async getChangedFilesForPR(
    repositoryOwner: string,
    repositoryName: string,
    pullRequestNumber: number
  ): Promise<IFile[]> {
    const responseBody = await this.octokit.paginate(this.octokit.rest.pulls.listFiles, {
      owner: repositoryOwner,
      repo: repositoryName,
      pull_number: pullRequestNumber
    })

    const files: IFile[] = responseBody.map(file => {
      return {filename: file.filename} as IFile
    })

    core.debug(`Pull request ${pullRequestNumber} includes following files: ${JSON.stringify(files)}`)

    return files
  }
}
