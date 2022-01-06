
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

        this.geneFruit(true)
        systemEvent.on(SystemEvent.EventType.TOUCH_START, this.moveFruit, this)
    }
    // 生成水果
    geneFruit (first: boolean) {
        this._FruitStatus = FruitStatus.INIT
        this._currentFruit = instantiate(this.fruitPrefab)
        const index = first ? 0 : (Math.random() * this._randomLength | 0)
        this._currentFruit.getChildByName('img').getComponent(Sprite).spriteFrame = this.fruits[index].iconSF
        const uiTransform = this._currentFruit.getChildByName('img').getComponent(UITransform)
        console.log(uiTransform)
        uiTransform.width = uiTransform.height = this._size * (1 + index / 5)
        const circleCollider2D = this._currentFruit.getChildByName('img').getComponent(CircleCollider2D)
        
        circleCollider2D.radius =  this._size * (1 + index / 5)/2
        circleCollider2D.on(Contact2DType.BEGIN_CONTACT, this.onTriggerEnter, this)
        this._currentFruit.parent = this.playPanel
    }
    // 鼠标按下--移动水果事件处理
    moveFruit (e) {
        console.log(e)
        console.log(e.getLocationX())
        if (this._currentFruit && this._FruitStatus === FruitStatus.INIT ) {
            // this._currentFruit.setWorldPosition(new Vec3(0, this._currentFruit.position.y, 0))
            tween(this._currentFruit.getChildByName('img'))
                .to(3, { position: new Vec3(100 ,0, 0) }, { onComplete: () => {
                    console.log(this._currentFruit.position)
                    console.log(this._currentFruit)
                } })
                .start()
        }
    }
    // 鼠标放开--开始自由落体
    drop () {
        if (this._currentFruit && this._FruitStatus === FruitStatus.INIT ) {
            this._FruitStatus = FruitStatus.DROPPING
            console.log(this._currentFruit)
            const rigidBody2D = this._currentFruit.getChildByName('img').getComponent(RigidBody2D)
            rigidBody2D.gravityScale = 2
            console.log(rigidBody2D)
            rigidBody2D.linearVelocity = new Vec2( Math.random() + -0.5 , 1)
            
        }
    }
    // 水果碰检测
    onTriggerEnter (selfCollider:Collider2D, otherCollider:Collider2D, contact: IPhysics2DContact | null) {
        console.log(selfCollider)
        console.log(otherCollider)
        if (otherCollider instanceof BoxCollider2D) {
            // 撞墙不做处理
        } else {
            console.log('检查是否是相同水果,合并相同水果')
        }
        // 碰撞完成重新生成水果(游戏未结束情况下)
        this._currentFruit.getChildByName('img').getComponent(CircleCollider2D).off(Contact2DType.BEGIN_CONTACT, this.onTriggerEnter, this)
        this._currentFruit = null
        this._FruitStatus = FruitStatus.DEAD
        setTimeout(_ => {
            this.geneFruit(false)
        })
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
