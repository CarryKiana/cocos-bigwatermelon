
import { _decorator, Component, Node, Vec2, Sprite, SpriteFrame, Vec3, instantiate, Prefab, random, tween } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Juice
 * DateTime = Tue Jan 11 2022 09:57:11 GMT+0800 (中国标准时间)
 * Author = carryKiana
 * FileBasename = Juice.ts
 * FileBasenameNoExtension = Juice
 * URL = db://assets/scripts/Juice.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */
interface JuiceConfig {
    pos: Vec2,
    width: Number
}
 
@ccclass('Juice')
export class Juice extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    private juiceConfig: JuiceConfig = {
        pos : null,
        width: null
    }

    @property({ type: SpriteFrame })
    private iconSF_l = null
    @property({ type: SpriteFrame })
    private iconSF_o = null
    @property({ type: SpriteFrame })
    private iconSF_q = null

    @property({ type: Prefab })
    public spriteTemp = null

    start () {
        // [3]
    }
    setConfig (data) {
        console.log('设置图片')
        console.log(data)
        this.iconSF_l = data.iconSF_l
        this.iconSF_o = data.iconSF_o
        this.iconSF_q = data.iconSF_q
    }

    showJuice (pos:Vec2, width: Number) {
        this.juiceConfig.pos = pos
        this.juiceConfig.width = width
        this.node.setWorldPosition(new Vec3(pos.x, pos.y, 0))
        this.setFruitL()
        this.setFruitO()
        this.setFruitQ()
    }

    setFruitL () {
        for (let i = 0; i< 10; i++) {
            const child = instantiate(this.spriteTemp)
            const spr = child.getComponent(Sprite)
            spr.spriteFrame = this.iconSF_l
            child.scale = new Vec3(0.3, 0.3, 1)
            child.parent = this.node

            const radius = +this.juiceConfig.width / 2 * Math.random() * 10
            const angle = 360 * Math.random()
            const location =new  Vec3(Math.cos(angle * Math.PI / 180) * radius,Math.sin(angle * Math.PI / 180) * radius, 0) 
            tween(child).by(0.2,{
                position: location
            }).by(0.2, {
                opacity: 0
            }).start()
        }
    }

    setFruitO () {
        for (let i = 0; i< 10; i++) {
            const child = instantiate(this.spriteTemp)
            const spr = child.getComponent(Sprite)
            spr.spriteFrame = this.iconSF_o
            child.scale = new Vec3(0.3, 0.3, 1)
            child.parent = this.node

            const radius = +this.juiceConfig.width / 2 * Math.random() * 10
            const angle = 360 * Math.random()
            const location =new  Vec3(Math.cos(angle * Math.PI / 180) * radius,Math.sin(angle * Math.PI / 180) * radius, 0) 
            tween(child).by(0.2,{
                position: location
            }).by(0.2, {
                opacity: 0
            }).start()
        }
    }

    setFruitQ () {
        const child = instantiate(this.spriteTemp)
            const spr = child.getComponent(Sprite)
            spr.spriteFrame = this.iconSF_q
            child.scale = new Vec3(0.3, 0.3, 1)
            child.parent = this.node

            tween(child).by(0.2, {
                opacity: 0
            },{
                onComplete: () => {
                    if (this.node) {
                        this.node.destroy()
                    }
                }
            }).start()
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
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
