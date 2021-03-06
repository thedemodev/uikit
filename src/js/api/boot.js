import {getComponentName} from './component';
import {apply, fastdom, hasAttr} from 'uikit-util';

export default function (UIkit) {

    const {connect, disconnect} = UIkit;

    if (!('MutationObserver' in window)) {
        return;
    }

    fastdom.read(init);

    function init() {

        if (document.body) {
            apply(document.body, connect);
        }

        (new MutationObserver(mutations => mutations.forEach(applyMutation))).observe(document, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });

        UIkit._initialized = true;
    }

    function applyMutation(mutation) {

        const {target, type} = mutation;

        const update = type !== 'attributes'
            ? applyChildList(mutation)
            : applyAttribute(mutation);

        return update && UIkit.update(target);
    }

    function applyAttribute({target, attributeName}) {

        if (attributeName === 'href') {
            return true;
        }

        const name = getComponentName(attributeName);

        if (!name || !(name in UIkit)) {
            return;
        }

        if (hasAttr(target, attributeName)) {
            UIkit[name](target);
            return true;
        }

        const component = UIkit.getComponent(target, name);

        if (component) {
            component.$destroy();
            return true;
        }

    }

    function applyChildList({addedNodes, removedNodes}) {

        for (let i = 0; i < addedNodes.length; i++) {
            apply(addedNodes[i], connect);
        }

        for (let i = 0; i < removedNodes.length; i++) {
            apply(removedNodes[i], disconnect);
        }

        return true;
    }

}
