
export async function createNewProject({ name }: { name: string }): Promise<any> {

  console.log(`create new project named ${name}`)

  // if directory with name exists, exit with error message
  // create directory with name (templated)
  //   - project name
  // change into directory (templated)
  //   - project name
  // initialize git repository
  // create github repo with hub (templated)
  //   - github username
  //   - project name
  // copy package.json (templated)
  //   - project name
  //   - github username
  //   - github repo name
  //   - description
  // copy .circleci/config.yml (templated)
  //   - docker username
  //   - project name
  // copy Dockerfile
  //
  // copy README.md (templated)
  //   - project name
  //   - description
  // copy tsconfig.json
  // copy src/server (templated)
  //   - project name
  //   - description
  // copy devops/chef/cookbook (templated)
  //   - project name
  //   - docker username

}
