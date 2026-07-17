export function Parent({ items }: { items: string[] }) {
  function Row({ item }: { item: string }) {
    return <li>{item}</li>;
  }
  return (
    <ul>
      {items.map((item) => (
        <Row key={item} item={item} />
      ))}
    </ul>
  );
}

function ModuleScopeRow({ item }: { item: string }) {
  return <li>{item}</li>;
}

export function CleanParent({ items }: { items: string[] }) {
  const format = (item: string) => item.trim();
  return (
    <ul>
      {items.map((item) => (
        <ModuleScopeRow key={item} item={format(item)} />
      ))}
    </ul>
  );
}
