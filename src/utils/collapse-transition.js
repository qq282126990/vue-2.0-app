import { addClass, removeClass } from './assist';

const Transition = {
      beforeEnter (el) {
            addClass(el, 'collapse-transition');

            if (!el.dataset) el.dataset = {};

            el.dataset.oldPaddingTop = el.style.paddingTop;
            el.dataset.oldPaddingBottom = el.style.paddingBottom;

            // 初始化
            el.style.height = '0';
            el.style.paddingTop = 0;
            el.style.paddingBottom = 0;
      },
      enter (el) {
            el.dataset.oldOverflow = el.style.overflow;

            // 设置高度
            if (el.scrollHeight !== 0) {
                  el.style.height = `${el.scrollHeight}px`;
                  el.style.paddingTop = el.dataset.oldPaddingTop;
                  el.style.paddingBottom = el.dataset.paddingBottom;
            }
            else {
                  el.style.height = '';
                  el.style.paddingTop = el.dataset.oldPaddingTop;
                  el.style.paddingBottom = el.dataset.oldPaddingBottom;
            }

            el.style.overflow = 'hidden';
      },
      afterEnter (el) {
            //对于safari：删除类然后重置高度是必要的
            removeClass(el, 'collapse-transition');
            el.style.height = '';
            el.style.overflow = el.dataset.oldOverflow;
      },
      beforeLeave (el) {
            if (!el.dataset) el.dataset = {};

            el.dataset.oldPaddingTop = el.style.paddingTop;
            el.dataset.oldPaddingBottom = el.style.paddingBottom;
            el.dataset.oldOverflow = el.style.overflow;

            // 设置高度
            el.style.height = `${el.scrollHeight}px`;
            el.style.overflow = 'hidden';
      },
      leave (el) {
            if (el.scrollHeight !== 0) {
                  // for safari: add class after set height, or it will jump to zero height suddenly, weired
                  addClass(el, 'collapse-transition');

                  el.style.height = 0;
                  el.style.paddingTop = 0;
                  el.style.paddingBottom = 0;
            }
      },
      afterLeave (el) {
            removeClass(el, 'collapse-transition');

            el.style.height = '';
            el.style.overflow = el.dataset.oldOverflow;
            el.style.paddingTop = el.dataset.oldPaddingTop;
            el.style.paddingBottom = el.dataset.oldPaddingBottom;
      }



}

export default {
      name: 'collapse-transition',
      functional: true,
      render (h, { children }) {
            const data = {
                  on: Transition
            };

            return h('transition', data, children);
      }
}