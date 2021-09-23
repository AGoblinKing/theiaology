export function Notify(title: string, body: string) {
  new Notification(title, { body })
}
