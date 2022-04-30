const group = attrs => {
  return setAttrs(document.createElement(attrs.type || 'div'), attrs);
};

const control = attrs => {
  return setAttrs(document.createElement('input'), attrs);
};

const button = attrs => {
  return setAttrs(document.createElement('button'), attrs);
};

const create = attrs => {
  const [el, key] = attrs.name.split('/');
  attrs.key = key;

  switch (el) {
    case 'group': return group(attrs);
    case 'control': return control(attrs);
    case 'button': return button(attrs);
    default: throw new Error(`Unknown element: ${el}`);
  }
};

const setAttrs = (el, attrs) => {
  const skipList = ['children', 'use_key', 'key', 'name'];
  if (el.nodeName !== 'INPUT') skipList.push('type');

  if (attrs.use_key)
    attrs.class = (attrs.class || []).push(attrs.key);

  for (const k in attrs) {
    if (skipList.indexOf(k) !== -1) continue;

    switch (k) {
      case 'actions':
        for (const action in attrs['actions'])
          el[`on${action}`] = attrs['actions'][action];
        break;
      case 'class':
        el.classList.add(...attrs['class']);
        break;
      case 'text':
        el.textContent = attrs['text'];
        break;
      default:
        el.setAttribute(k, attrs[k]);
    }
  }

  return el;
};


const build = (elem, ui = document.createDocumentFragment()) => {
  let x = create(elem);
  insert(ui, x);

  if (!elem.children) {
    return ui;
  }

  for (const child of elem.children) {
    ui = build(child, x);
  }

  return ui;
};


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

const append = (mount, a) => {
  mount.after(Array.isArray(a) ? wrapEls(a) : a);
  return mount;
}

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

// export {
//   build, create, insert, prepend, append, clone, edit, children, parent,
//   ancestor, descendant, descendants, siblings, remove
// };

