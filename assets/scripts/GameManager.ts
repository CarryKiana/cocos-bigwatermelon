
import { _decorator, Component, Node, Label, SystemEvent, systemEvent, Prefab, instantiate, RigidBody2D, Vec2, CircleCollider2D, Contact2DType, Collider2D, IPhysics2DContact, BoxCollider2D, CCInteger, SpriteFrame, Sprite, UITransform, tween, Vec3, AudioClip, AudioSource  } from 'cc';

import { GameState, FruitStatus } from './GameDefine'
const { ccclass, property } = _decorator;

@ccclass('FruitItem')
class FruitItem {
    @property({ type: CCInteger })
    public id = 0
    @property({ type: SpriteFrame })
    public iconSF = null
}
@ccclass('JuiceItem')
class JuiceItem {
    @property({ type: CCInteger })
    public id = 0
    @property({ type: SpriteFrame })
    public iconSF_l = null
    @property({ type: SpriteFrame })
    public iconSF_o = null
    @property({ type: SpriteFrame })
    public iconSF_q = null
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
    public fruits: FruitItem[] = []

    @property({ type: JuiceItem })
    public juices: JuiceItem[] = []

    @property({ type: AudioClip })
    public AudioBoom = null
    @property({ type: AudioClip })
    public AudioWater = null
    @property({ type: AudioClip })
    public AudioKnock = null
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
        this._currentFruit = this.geneFruit(true, null, null)

        systemEvent.on(SystemEvent.EventType.TOUCH_START, this.startMoveFruit, this)
        systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this.keepMoveFruit, this)
        systemEvent.on(SystemEvent.EventType.TOUCH_END, this.drop, this)
    }
    // 生成水果
    geneFruit (first: boolean, location: Vec2 | null, target: number | null) {
        const fruit = instantiate(this.fruitPrefab)
        fruit.parent = this.playPanel
        fruit.getChildByName('img').on('sameContact', ({ selfCollider, otherCollider, contact }) => {
            otherCollider.node.off('sameContact')
            this.contactFruit(selfCollider, otherCollider, contact)
        })
        
        if (location) {
            fruit.setWorldPosition(new Vec3(location.x, location.y, 0))
            fruit.getChildByName('img').position = new Vec3(0,0,0)
        }
        const index = target || (first ? 0 : (Math.random() * this._randomLength | 0))
        fruit.getComponent('Fruit').setFruit({ ...this.fruits[index], size: this._size })
        return fruit
    }
    // 合成水果
    contactFruit (selfCollider, otherCollider, contact) {
        const worldManifold =  contact.getWorldManifold()
        const points = worldManifold.points
        const normal = worldManifold.normal
        const next = selfCollider.node.parent.getComponent('Fruit')['index']
        if (next === 12) {
            // 超出最大水果，游戏结束todo
            return
        }
        setTimeout(_ => {
            selfCollider.node.parent.destroy()
            otherCollider.node.parent.destroy()
            const newFruit = this.geneFruit(false, points[0], next)
            const rigidBody2D = newFruit.getChildByName('img').getComponent(RigidBody2D)
            rigidBody2D.gravityScale = 3
            rigidBody2D.linearVelocity = normal.clone() // new Vec2( Math.random() + -0.5 , 1)
            this.playAudio()
        })
        // 计算分数 todo
        // 播放特效 todo
    }
    // 播放合成音效
    playAudio() {
        const audioSource = this.node.getComponent(AudioSource)
        audioSource.playOneShot(this.AudioBoom)
        audioSource.playOneShot(this.AudioWater)
    }
    // 播放合成动画
    playAnimation() {

    }
    // 鼠标按下--移动水果事件处理
    startMoveFruit (e) {
        if (this._currentFruit && this._FruitStatus === FruitStatus.INIT ) {
            tween(this._currentFruit)
                .to(0.1, { worldPosition: new Vec3(e.getLocationX()/2, this._currentFruit.getWorldPosition().y, 0) }, { onComplete: () => {
                    // console.log(this._currentFruit.position)
                    // console.log(this._currentFruit)
                }, onUpdate: () => {
                    this._currentFruit.getChildByName('img').position = new Vec3(0,0,0)
                } })
                .start()
        }
    }
    // 鼠标拖动 -- 变更水果位置
    keepMoveFruit (e) {
        if (this._currentFruit && this._FruitStatus === FruitStatus.INIT ) {
            let x = e.getLocationX()/2
            const radius = this._currentFruit.getChildByName('img').getComponent(CircleCollider2D).radius
            x = x < radius ? radius : x
            x = x > (375 - radius) ? (375 - radius) : x
            this._currentFruit.setWorldPosition(new Vec3(x, this._currentFruit.getWorldPosition().y, 0))
            this._currentFruit.getChildByName('img').position = new Vec3(0,0,0)
        }
    }
    // 鼠标放开--开始自由落体
    drop () {
        if (this._currentFruit && this._FruitStatus === FruitStatus.INIT ) {
            const audioSource = this.node.getComponent(AudioSource)
            audioSource.playOneShot(this.AudioKnock)
            this._FruitStatus = FruitStatus.DROPPING
            const rigidBody2D = this._currentFruit.getChildByName('img').getComponent(RigidBody2D)
            rigidBody2D.gravityScale = 3
            rigidBody2D.linearVelocity = new Vec2( Math.random() + -0.5 , 1)
            this._timer = setTimeout(_ => {
                this._FruitStatus = FruitStatus.INIT
                this._currentFruit = this.geneFruit(false, null, null)
            }, 1000)
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
