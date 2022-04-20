# True Declarative UI v0.7.0

> Work in Progress (not production-ready)

Core idea of my lib is using declarative language to describe UI, then make UI
elements for any platforms (Browser, CLI, Mobile, etc...) based on this
description.


## Declarative UI description
```yaml
---
group/auth-page:
  type: form
  use_key: true
  payload:
    group/login:
      payload:
        control/login:
          type: text
          label: User login
          required: true
    control/password:
      type: text
```

For example - this description can be converted in browser DOM:

```html
<form class="auth-page">
  <div>
    <label for="login">User login</label>
    <input type="text" required="true" name="login">
  </div>
  <input type="text" name="password">
</form>
```
