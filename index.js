import { type } from './utils/typecheck.js';

const ViewModel = class {
  static #private = Symbol();
  static get(data) {
    return new ViewModel(this.#private, data);
  }
  styles = {};
  attributes = {};
  properties = {};
  events = {};
  constructor(checker, data) {
    if (checker != ViewModel.#private) throw 'useViewModel.get()!';
    Object.entries(data).forEach(([k, v]) => {
      switch (k) {
        case 'styles':
          this.styles = v;
          break;
        case 'attributes':
          this.attributes = v;
          break;
        case 'properties':
          this.properties = v;
          break;
        case 'events':
          this.events = v;
          break;
        default:
          this[k] = v;
      }
    });
    Object.seal(this);
  }
};

const BinderItem = class {
  el;
  viewmodel;
  constructor(
    el,
    viewmodel,
    _0 = type(el, HTMLElement),
    _1 = type(viewmodel, 'string')
  ) {
    this.el = el;
    this.viewmodel = viewmodel;
    Object.freeze(this);
  }
};

const Binder = class {
  #items = new Set();
  add(v, _ = type(v, BinderItem)) {
    this.#items.add(v);
  }
  render(viewmodel, _ = type(viewmodel, ViewModel)) {
    this.#items.forEach(item => {
      const vm = type(viewmodel[item.viewmodel], ViewModel),
        el = item.el;
      Object.entries(vm.styles).forEach(([k, v]) => (el.style[k] = v));
      Object.entries(vm.attributes).forEach(([k, v]) => el.setAttribute(k, v));
      Object.entries(vm.properties).forEach(([k, v]) => (el[k] = v));
      Object.entries(vm.events).forEach(
        ([k, v]) => (el['on' + k] = e => v.call(el, e, viewmodel))
      );
    });
  }
};

const Scanner = class {
  scan(el, _ = type(el, HTMLElement)) {
    const binder = new Binder();
    this.checkItem(binder, el);
    const stack = [el.firstElementChild];
    let target;
    while ((target = stack.pop())) {
      this.checkItem(binder, target);
      if (target.firstElementChild) stack.push(target.firstElementChild);
      if (target.nextElementSibling) stack.push(target.nextElementSibling);
    }
    return binder;
  }
  checkItem(binder, el) {
    const vm = el.getAttribute('data-viewmodel');
    if (vm) binder.add(new BinderItem(el, vm));
  }
};

/**
 * [view model]
 * - 그림을 그리기 위해 view model을 바꿔야만 가능하다.
 * - changeContent를 통해서만 바꾼다.
 * - 바인딩을 통해서 모델 기준으로 렌더링한다.
 * - 이벤트 안에 클릭 이벤트가 들어온다.
 */

const viewModel = ViewModel.get({
  isStop: false,
  changeContents() {
    this.wrapper.styles.background = `rgb(${
      parseInt(Math.random() * 150) + 100
    },${parseInt(Math.random() * 150) + 100},${
      parseInt(Math.random() * 150) + 100
    })`;
    this.contents.properties.innerHTML = Math.random()
      .toString(16)
      .replace('.', '');
  },
  wrapper: ViewModel.get({
    styles: {
      margin: '0 auto',
      width: '50vw',
      height: '40vw',
      background: 'tomato',
      cursor: 'pointer',
    },
    events: {
      click(_, vm) {
        vm.isStop = true;
      },
    },
  }),
  title: ViewModel.get({ properties: { innerHTML: 'Click Me' } }),
  contents: ViewModel.get({ properties: { innerHTML: 'Contents' } }),
});

const scanner = new Scanner();
const binder = scanner.scan(document.querySelector('#target'));
binder.render(viewModel);

const f = _ => {
  viewModel.changeContents();
  binder.render(viewModel);
  if (!viewModel.isStop) requestAnimationFrame(f);
};

requestAnimationFrame(f);
