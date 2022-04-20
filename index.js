const fst = xs => xs.shift();
const snd = xs => fst(xs.slice(1, 2));
const last = xs => xs.pop();
const tail = xs => xs.slice(1);
const init = xs => xs.slice(0, -1);

// Document
// activeElement
// embeds
// forms
// images
// links
// visibilityState
// elementFromPoint()
// getSelection()

// Node
// parentNode
// parentElement
// childNodes
// firstChild
// lastChild
// isConnected
// textContent
// appendChild()
// insertBefore()
// cloneNode()
// replaceChild()
// removeChild()
// contains()
// isEqualNode()
// isSameNode()
// normalize()

// Element
// firstElementChild
// lastElementChild
// childElementCount
// dispatchEvent()
// removeEventListener()
// toggleAttribute()
// hasAttribute()
// hasAttributes()
// removeAttribute()
// setAttribute()
// getAttribute()
// getAttributeNames()
// matches()


// Keywords:
// text ~ (span tag)
// group (type="section/article/header/...")
// list
// media
// table
// control
// modal

const el = (name, attrs) => {
  const x = document.createElement(name);

  for (const k in attrs) {
    if (k === 'events') {
      for (const action in attrs[k])
        x[`on${action}`] = attrs[k][action];
    } else if (k === 'class') {
      x.classList.add(attrs.class);
    } else if (k === 'content') {
      x.textContent = attrs.content;
    } else {
      x.setAttribute(k, attrs[k]);
    }
  }

  return x;
};

const group = attrs => {
  const name = attrs.type || 'div';
  delete attrs.type;

  return el(name, attrs);
}

const control = attrs => {
  const name = 'input';
  switch (attrs.type) {
    case 'longtext': attrs.type = 'textarea';
  }

  let label;
  if (attrs.label) {
    label = el('label', {for: attrs.name, content: attrs.label})
    delete attrs.label;
  }

  let x = el(name, attrs);

  if (label) {
    z = document.createDocumentFragment();
    insert(z, label);
    insert(z, x);
    return z;
  }

  return x;
};

const elx = (id, attrs) => {
  let tag;
  const [role, key] = id.split('/');

  switch (role) {
    case 'group':
      tag = attrs.type || 'div';
      if (key) attrs.class = key;
      break;
    case 'control':
      tag = 'input';
      if (key) attrs.name = key
      break;
    case 'text':
      tag = attrs.type === 'block' ? 'p' : 'span';
      if (key) attrs.class = key;
      break;
    default: throw Error('Unknown element\'s type');
  }

  const x = document.createElement(tag);

  for (const k in attrs) {
    if (k === 'payload') continue;

    if (k === 'events') {
      for (const action in attrs[k])
        x[`on${action}`] = attrs[k][action];
    } else
      x.setAttribute(k, attrs[k]);
  }

  return x;
};

const drop = el => el.remove();

const parent = el => el.parentElement;
const children = (el, sel) => {
  let xs = [];
  for (const x of el.children)
    if (x.matches(sel)) xs.push(x);

  return xs;
};
const siblings = (el, sel) =>
  children(parent(el), sel).filter(x => !x.isEqualNode(el));

const ancestor = (from, sel) => from.closest(sel);
const descendant = (from, sel) => from.querySelector(sel);
const descendants = (from, sel) => [...from.querySelector(sel)];

const wrapEls = els =>
  els.reduce((fragm, el) => {
    fragm.appendChild(el);
    return fragm;
  }, document.createDocumentFragment());

const insert = (mount, a) => {
  mount.append(Array.isArray(a) ? wrapEls(a) : a);

  return a;
}

const prepend = (mount, a) =>
  mount.before(Array.isArray(a) ? wrapEls(a) : a);

const append = (mount, a) =>
  mount.after(Array.isArray(a) ? wrapEls(a) : a);

const edit = (el, attrs) => {
  for (const k in attrs) {
    el.setAttribute(k, attrs[k]);
  }

  return el;
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

const fragment = (t, dom = document.createDocumentFragment()) => {
  for (const k of Object.keys(t)) {
    const [role, key] = k.split('/');

    let attrs = {};
    for (const attr of Object.keys(t[k])) {
      if (attr === 'payload') continue;
      attrs[attr] = t[k][attr];
    }
    if (role === 'control')
      attrs.name = key;
    else if (attrs.use_key) {
      attrs.class = key;
      delete attrs.use_key;
    }

    let x;
    switch (role) {
      case 'group':
        x = group(attrs);
        break;
      case 'control':
        x = control(attrs);
        break;
    }

    if (t[k].payload != undefined) {
      x = fragment(t[k].payload, x);
    }

    insert(dom, x);
  }

  return dom;
};

// export {
//   fragment, insert, prepend, append, clone, edit, children, parent, ancestor,
//   descendant, descendants, siblings, drop
// };
