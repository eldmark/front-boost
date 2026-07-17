export function Unsafe({ body }: { body: string }) {
  return <div dangerouslySetInnerHTML={{ __html: body }} />;
}

export function SafeLiteral() {
  return <div dangerouslySetInnerHTML={{ __html: "<b>static</b>" }} />;
}
