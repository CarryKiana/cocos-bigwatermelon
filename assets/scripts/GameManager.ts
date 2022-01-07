
import { _decorator, Component, Node, Label, SystemEvent, systemEvent, Prefab, instantiate, RigidBody2D, Vec2, CircleCollider2D, Contact2DType, Collider2D, IPhysics2DContact, BoxCollider2D, CCInteger, SpriteFrame, Sprite, UITransform, tween, Vec3  } from 'cc';

import { GameState, FruitStatus } from './GameDefine'
const { ccclass, property } = _decorator;

@ccclass('FruitItem')
class FruitItem {
    @property({ type: CCInteger })
    public id = 0
    @property({ type: SpriteFrame })
    public iconSF = null
}

/**
 * Predefined variables
 * Name = GameManager
 * DateTime = Thu Jan 06 2022 10:34:10 GMT+0800 (中国标准时间)
 * Author = carryKiana
 * FileBasename = GameManager.ts
 * FileBasenameNoExtension = GameManager
 * URL = db://assets/scripts/GameManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */
 
@ccclass('GameManager')
export class GameManager extends Component {
    // [1]
    // dummy = '';
    private _GameStatus = GameState.INIT
    private _ScoreValue = 0
    private _ComboValue = 1
    private _currentFruit = null
    private _force = new Vec2(0, -1)
    private _randomLength = 6
    private _size = 20
    private _FruitStatus = FruitStatus.INIT
    private _index = null
    private _timer = null

    @property({ type: Node })
    public playPanel = null
    @property({ type: Node })
    public successPanel = null
    @property({ type: Node })
    public failPanel = null
    @property({ type: Node })
    public ScoreLabel = null
    @property({ type: Node })
    public ComboLabel = null
    @property({ type: Node })
    public LineNode = null

    @property({ type: Prefab })
    public fruitPrefab = null

    @property({ type: FruitItem })
    public fruits: FruitItem[] = [];
    // [2]
    // @property
    // serializableDummy = 0;
 
    start () {
        // [3]
        this._GameStatus = GameState.INIT
        this._ScoreValue = 0
        this._ComboValue = 1
        this.LineNode.active = false
        const LabelComp = this.ComboLabel.getComponent(Label)
        LabelComp.string = 'X ' + this._ComboValue
        this.ComboLabel.active = false

        this._FruitStatus = FruitStatus.INIT
        this.geneFruit(true, null, null)

        systemEvent.on(SystemEvent.EventType.TOUCH_START, this.startMoveFruit, this)
        systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this.keepMoveFruit, this)
        systemEvent.on(SystemEvent.EventType.TOUCH_END, this.drop, this)
    }
    // 生成水果
    geneFruit (first: boolean, location: Vec2 | null, target: number | null) {
        this._currentFruit = instantiate(this.fruitPrefab)
        this._currentFruit.parent = this.playPanel

        if (location) {
            this._currentFruit.setWorldPosition(new Vec3(location.x, location.y, 0))
            this._currentFruit.getChildByName('img').position = new Vec3(0,0,0)
        }
        const index = target || (first ? 0 : (Math.random() * this._randomLength | 0))
        this._currentFruit.getComponent('Fruit').index = index
        console.log('生成的', index)
        this._currentFruit.getChildByName('img').getComponent(Sprite).spriteFrame = this.fruits[index].iconSF
        const uiTransform = this._currentFruit.getChildByName('img').getComponent(UITransform)
        uiTransform.width = uiTransform.height = this._size * (1 + index / 5)
        const circleCollider2D = this._currentFruit.getChildByName('img').getComponent(CircleCollider2D)
        circleCollider2D.radius =  this._size * (1 + index / 5)/2
        circleCollider2D.on(Contact2DType.BEGIN_CONTACT, this.onTriggerEnter, this)
        circleCollider2D.apply()
    }
    // 鼠标按下--移动水果事件处理
    startMoveFruit (e) {
        if (this._currentFruit && this._FruitStatus === FruitStatus.INIT ) {
            tween(this._currentFruit)
                .to(0.1, { worldPosition: new Vec3(e.getLocationX()/2, this._currentFruit.getWorldPosition().y, 0) }, { onComplete: () => {
                    console.log(this._currentFruit.position)
                    console.log(this._currentFruit)
                }, onUpdate: () => {
                    this._currentFruit.getChildByName('img').position = new Vec3(0,0,0)
                } })
                .start()
        }
    }
    // 鼠标拖动 -- 变更水果位置
    keepMoveFruit (e) {
        if (this._currentFruit && this._FruitStatus === FruitStatus.INIT ) {
            this._currentFruit.setWorldPosition(new Vec3(e.getLocationX()/2, this._currentFruit.getWorldPosition().y, 0))
            this._currentFruit.getChildByName('img').position = new Vec3(0,0,0)
        }
    }
    // 鼠标放开--开始自由落体
    drop () {
        if (this._currentFruit && this._FruitStatus === FruitStatus.INIT ) {
            this._FruitStatus = FruitStatus.DROPPING
            const rigidBody2D = this._currentFruit.getChildByName('img').getComponent(RigidBody2D)
            rigidBody2D.gravityScale = 3
            rigidBody2D.linearVelocity = new Vec2( Math.random() + -0.5 , 1)
        }
    }
    // 水果碰撞检测
    onTriggerEnter (selfCollider:Collider2D, otherCollider:Collider2D, contact: IPhysics2DContact | null) {
        console.log(selfCollider)
        console.log(otherCollider)
        console.log(selfCollider.node.parent.getComponent('Fruit')['index'])
        if (otherCollider instanceof BoxCollider2D  && otherCollider.node.name !== 'background-border') {
            // 撞两边墙不做处理
        } else {
            console.log('检查是否是相同水果,合并相同水果')
            // 相同水果的情况下，消除相同水果，在碰撞点生成一个上级水果自由下落
            // otherCollider.node.parent.destroy()
            // 非相同水果不做处理
            // 碰撞完成判断游戏是否结束，结束显示弹窗
            // 未结束重新生成水果
            this._currentFruit.getChildByName('img').getComponent(CircleCollider2D).off(Contact2DType.BEGIN_CONTACT, this.onTriggerEnter, this)
            if (otherCollider.node.name === 'background-border' || selfCollider.node.parent.getComponent('Fruit')['index'] !== otherCollider.node.parent.getComponent('Fruit')['index'] ) {
                this._currentFruit = null
                this._FruitStatus = FruitStatus.DEAD
                clearTimeout(this._timer)
                 this._timer = setTimeout(_ => {
                    this._FruitStatus = FruitStatus.INIT
                    this.geneFruit(false, null, null)
                })
            } else {
                const worldManifold =  contact.getWorldManifold()
                const points = worldManifold.points
                const normal = worldManifold.normal
                setTimeout(_ => {
                    const next = selfCollider.node.parent.getComponent('Fruit')['index'] + 1
                    selfCollider.node.parent.removeFromParent()
                    otherCollider.node.parent.removeFromParent()
                    clearTimeout(this._timer)
                    this.geneFruit(false, points[0], next)
                    const rigidBody2D = this._currentFruit.getChildByName('img').getComponent(RigidBody2D)
                    rigidBody2D.gravityScale = 3
                    rigidBody2D.linearVelocity = new Vec2( Math.random() + -0.5 , 1)
                })
            }
            // selfCollider.node.parent.destroy()

        }
    }
    // update (deltaTime: number) {
    //     // [4]
    // }
    onDestroy () {
        systemEvent.off(SystemEvent.EventType.TOUCH_START, this.drop, this)
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
