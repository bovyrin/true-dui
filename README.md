# True Declarative UI v0.7.0

> Work in Progress (not production-ready)

Core idea of my lib is using declarative language to describe UI, then make UI
elements for any platforms (Browser, CLI, Mobile, etc...) based on this
description.


## Declarative UI description
```yaml
---
group/auth-page:
  role: form
  use_key: true
  children:
    input/login:
      role: text
      label: Email
      required: true
    input/password:
      role: text
      label: Password
```

For example - this description can be converted in browser DOM:

```html
<form class="auth-page">
  <div>
    <label for="login">Email</label>
    <input required="true" name="login" id="login" type="text">
  </div>
  <div>
    <label for="password">Password</label>
    <input name="password" id="password" type="text">
  </div>
</form>
```
