interface TreeNode {
  name: string;
  children?: TreeNode[];
  value?: unknown;
}

function isPlainObject(any: any) {
  return !!any && typeof any === "object";
}

export const getNodeByName = (tree: TreeNode, key: string): TreeNode | null => {
  let node = null;

  visit(
    tree,
    (d) => {
      if (d.name === key) {
        node = d;
      }
    },
    (d) => d.children
  );

  return node;
};

export default function map2tree<T>(
  root: { [key: string]: any },
  options: { key?: string; pushMethod?: "push" | "unshift" } = {},
  tree: TreeNode = { name: options.key || "state", children: [] }
): T | {} {
  const { key: rootNodeKey = "state", pushMethod = "push" } = options;
  const currentNode = getNodeByName(tree, rootNodeKey);

  if (currentNode === null) {
    return {};
  }

  for (const key of Object.keys(root)) {
    const value = root[key];
    const newNode: TreeNode = { name: key };

    if (Array.isArray(value)) {
      console.log("1", value);

      newNode.children = [];

      for (let i = 0; i < value.length; i++) {
        newNode.children[pushMethod]({
          name: `${key}[${i}]`,
          [isPlainObject(value[i]) ? "object" : "value"]: value[i]
        });
      }
    } else if (isPlainObject(value)) {
      console.log("2", value);
      newNode.children = [];
    } else {
      console.log("3", value);
      newNode.value = value;
    }

    if (currentNode.children) currentNode.children[pushMethod](newNode);

    map2tree(value, { key, pushMethod }, tree);
  }

  return tree;
}

export const visit = (
  node: any,
  visitFn: (parent: any) => void,
  childrenFn: (parent: any) => any[] | undefined
): void => {
  if (!node) return;

  visitFn(node);

  const children = childrenFn(node);

  if (children)
    for (let i = 0; i < children.length; i++)
      visit(children[i], visitFn, childrenFn);
};
