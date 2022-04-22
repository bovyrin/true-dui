// API
// build

// An specific implementation
// create
// edit
// remove
// insert
// prepend
// append
// parent
// children
// siblings
// ancestor
// descendant
// descendants


// Types of elem
// group
// text
// input
// button
// link
// table

// Elem's type example
// <type>/<name>
//    role: specify element
//    value: text content or control values
//    children: nested elements

const remove = el => el.remove();

const parent = el => el.parentElement;
const children = (el, sel) => {
  if (sel == '*') return el.children;

  let xs = [];
  for (const x of el.children)
    if (x.matches(sel)) xs.push(x);

  return xs;
};
const siblings = (el, sel) =>
  children(parent(el), sel).filter(x => !x.isEqualNode(el));

const ancestor = (from, sel) => from.closest(sel);
const descendant = (from, sel) => from.querySelector(sel);
const descendants = (from, sel) => [...from.querySelectorAll(sel)];

const wrapEls = els =>
  els.reduce((fragm, el) => {
    fragm.appendChild(el);
    return fragm;
  }, document.createDocumentFragment());

const insert = (mount, a) => {
  mount.append(Array.isArray(a) ? wrapEls(a) : a);

  return mount;
}

const prepend = (mount, a) =>
  mount.before(Array.isArray(a) ? wrapEls(a) : a);

const append = (mount, a) =>
  mount.after(Array.isArray(a) ? wrapEls(a) : a);

const edit = (el, attrs) => {
  if (attrs.use_key) {
    const className = (attrs.class || [])
    className.push(attrs.key)
    attrs.class = className;
    delete attrs.use_key;
    delete attrs.key;
  }

  for (const k in attrs) {
    if (k === 'actions') {
      for (const action in attrs[k])
        el[`on${action}`] = attrs[k][action];
    } else if (k === 'class') {
      el.classList.add(...attrs[k]);
    } else {
      el.setAttribute(k, attrs[k]);
    }
  }

  return el;
};

const create = (name, attrs) => edit(document.createElement(name), attrs);

const group = attrs => {
  const name = attrs.role || 'div';
  if (attrs.role) delete attrs.role;

  return create(name, attrs);
};

const input = attrs => {
  const role = attrs.role;
  if (attrs.role) delete attrs.role;

  attrs.name = attrs.key;
  attrs.id = attrs.key;

  let label = null;
  if (attrs.label) {
    label = create('label', {for: attrs.name});
    label.textContent = attrs.label || '';
    delete attrs.label;
  }

  let input;
  switch (role) {
    case 'num':
      attrs.type = 'number';
      input = create('input', attrs);
      return insert(group({}), label ? [label, input] : input);
    case 'list':
      const options = (attrs.items || []).map(([k, v]) => {
        const option = create('option', {value: k});
        option.textContent = v;
        if (attrs.value == k) option.setAttribute('selected', true);
        return option;
      });
      if (attrs.items) delete attrs.items;

      input = insert(
        create('select', attrs),
        options
      );

      return insert(group({}), label ? [label, input] : input);
    default:
      attrs.type = 'text';
      input = create('input', attrs);
      return insert(group({}), label ? [label, input] : input);
  }
};

const elem = (id, attrs) => {
  const [type, key] = id.split('/');
  attrs.key = key;

  switch (type) {
    case 'group': return group(attrs);
    case 'text': return text(attrs);
    case 'link': return link(attrs);
    case 'input': return input(attrs);
    case 'button': return button(attrs);
    case 'table': return table(attrs);
    default: throw new Error('Unknown type');
  };
};

const clone = el => {
  const el2 = el.cloneNode(true);

  // clone event's handlers
  for (const k in el)
    if (k.startsWith('on') && el[k] != null) el2[k] = el[k];

  const elsChildren = [
    el.querySelectorAll('*'),
    el2.querySelectorAll('*')
  ];

  for (let i = 0; i < elsChildren[0].length; i += 1) {
    for (const k in elsChildren[0][i]) {
      if (k.startsWith('on') && elsChildren[0][i][k] != null)
        elsChildren[1][i][k] = elsChildren[0][i][k];
    }
  }

  return el2;
};

// TODO: extract fragment's function
const build = (dui, dom = document.createDocumentFragment()) => {
  for (const k of Object.keys(dui)) {
    let attrs = {...dui[k]};
    delete attrs.children;

    // TODO: extract the function
    let x = elem(k, attrs);

    if (dui[k].children != undefined) {
      x = build(dui[k].children, x);
    }

    // TODO: extract the function
    insert(dom, x);
  }

  return dom;
};

export {
  build, create, insert, prepend, append, clone, edit, children, parent,
  ancestor, descendant, descendants, siblings, remove
};

