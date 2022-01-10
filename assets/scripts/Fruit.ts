
import { _decorator, Component, Node, Sprite, UITransform, CircleCollider2D, Contact2DType, Collider2D, IPhysics2DContact, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Fruit
 * DateTime = Fri Jan 07 2022 17:32:58 GMT+0800 (中国标准时间)
 * Author = carryKiana
 * FileBasename = Fruit.ts
 * FileBasenameNoExtension = Fruit
 * URL = db://assets/scripts/Fruit.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */
 
@ccclass('Fruit')
export class Fruit extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    @property ( { type: CCInteger })
    public index: Number = 0

    start () {
        // [3]
    }
    setFruit (data) {
        this.index = data.id
        this.node.getChildByName('img').getComponent(Sprite).spriteFrame = data.iconSF
        const uiTransform = this.node.getChildByName('img').getComponent(UITransform)
        uiTransform.width = uiTransform.height = data.size * (1 + data.id/ 5)
        const circleCollider2D = this.node.getChildByName('img').getComponent(CircleCollider2D)
        circleCollider2D.radius =  data.size * (1 + data.id / 5)/2
        circleCollider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
        circleCollider2D.apply()
    }

    onBeginContact (selfCollider:Collider2D, otherCollider:Collider2D, contact: IPhysics2DContact | null) {
        if (selfCollider.tag !== otherCollider.tag) return
        if (selfCollider.node && otherCollider.node) {
            const selfFruit = selfCollider.node.parent.getComponent('Fruit')
            const otherFruit = otherCollider.node.parent.getComponent('Fruit')
            if (selfFruit && otherFruit && selfFruit['index'] === otherFruit['index']) {
                selfCollider.node.emit('sameContact', { selfCollider, otherCollider, contact })
            }
        }
    }
    // update (deltaTime: number) {
    //     // [4]
    // }
    onDestroy () {
        this.node.removeFromParent()
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/zh/scripting/life-cycle-callbacks.html
 */
