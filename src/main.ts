import inquirer from 'inquirer'
import chalk from 'chalk'

import { checkDate } from './check'
import { GitHubRepo} from './github'

const main = async () => {
  const questions  = [
    {
      type: 'input',
      name: 'owner',
      message: 'Who owns this repository?'
    },
    {
      type: 'input',
      name: 'repo',
      message: "What's the name of the repo?"
    },
    {
      type: 'input',
      name: 'threshold',
      message: 'How old of issues are you checking (months back as number)',
      validate: (input: string) => {
        return new Number(input) !== NaN
      }
    }
  ]

  const answers = await inquirer.prompt(questions) as {
    owner: string,
    repo: string,
    threshold: string
  }

  const { owner, repo, threshold } = answers
  const t = parseInt(threshold)

  const gh = new GitHubRepo({
    owner,
    repo
  })
  
  const issues = (await gh.issues()).reverse()
  const old    = issues.filter(issue => {
    return checkDate({
      threshold: t,
      issue: issue.updated_at
    })
  })
  console.log(`There are ${old.length} hung issues. Here they are:`)
  old.forEach(i => {
    console.log(`${chalk.red(`#${i.number}`)} ${i.title}`)
  })
}
main()