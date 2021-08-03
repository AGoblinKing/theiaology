export class Tester {
  static testers: Tester[] = []

  static runAll() {
    for (let tester of Tester.testers) {
      tester.run()
    }
  }

  private lastPromise: Promise<any>
  private resolver: (value?: any) => void

  constructor() {
    this.lastPromise = new Promise((resolve) => {
      this.resolver = resolve
    })
    Tester.testers.push(this)
  }

  test(name: string, fn: Function) {
    this.lastPromise = this.lastPromise.then(() => {
      console.log(`TEST > `, name)
      return fn(this)
    })

    return this
  }

  run() {
    this.resolver()
  }

  error(name: string, ...args: any[]) {
    console.error(name, ...args)
  }
}
