import { nextTick, onBeforeUnmount, reactive, toRefs, watch } from 'vue';

import { createPopper } from '@popperjs/core';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import flip from '@popperjs/core/lib/modifiers/flip';
import offset from '@popperjs/core/lib/modifiers/offset';
import maxSize from 'popper-max-size-modifier';

export function usePopper({ emit, popperNode, triggerNode, placement }) {
  const state: {
    isOpen: boolean;
    popperInstance: ReturnType<typeof createPopper> | null;
  } = reactive({
    isOpen: false,
    popperInstance: null,
  });

  const setPopperEventListeners = enabled => {
    state.popperInstance?.setOptions((options: any) => ({
      ...options,
      modifiers: [...options.modifiers, { name: 'eventListeners', enabled }],
    }));
  };

  const enablePopperEventListeners = () => setPopperEventListeners(true);
  const disablePopperEventListeners = () => setPopperEventListeners(false);

  const close = () => {
    if (!state.isOpen) {
      return;
    }

    state.isOpen = false;
    emit('close:popper');
  };

  const open = () => {
    if (state.isOpen) {
      return;
    }

    state.isOpen = true;
    emit('open:popper');
  };

  watch([() => state.isOpen, placement], async ([isOpen]) => {
    if (isOpen) {
      await initializePopper();
      enablePopperEventListeners();
    } else {
      disablePopperEventListeners();
    }
  });

  const initializePopper = async () => {
    await nextTick();
    state.popperInstance = createPopper(triggerNode.value, popperNode.value, {
      placement: placement.value,
      modifiers: [
        preventOverflow,
        {
          name: 'preventOverflow',
          options: {
            padding: 15,
          },
        },
        flip,
        {
          name: 'flip',
          enabled: true,
          options: {
            allowedAutoPlacements: ['top', 'bottom'],
          },
        },
        offset,
        {
          name: 'offset',
          options: {
            offset: [0, 10],
          },
        },
        maxSize,
        {
          name: 'applyMaxSize',
          enabled: true,
          phase: 'beforeWrite',
          requires: ['maxSize'],
          fn(props) {
            const { height, width } = props.state.modifiersData.maxSize;

            props.state.styles.popper = {
              ...props.state.styles.popper,
              maxHeight: `${height - 10}px`,
              maxWidth: `min(calc(100vw - 30px), ${width}px)`,
            };
          },
        },
      ],
    });

    state.popperInstance.update();
  };

  onBeforeUnmount(() => {
    state.popperInstance?.destroy();
  });

  return {
    ...toRefs(state),
    open,
    close,
  };
}
