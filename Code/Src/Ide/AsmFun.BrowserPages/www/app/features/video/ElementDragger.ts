import { IDragableElement } from "./data/VideoData.js";

export interface IElementDragger {
    ResetStartPos(x:number | null,y:number | null);
    element: HTMLElement;
    StartXOffset: number;
    StartYOffset: number;
    spriteG: any;
    Dispose();
}
export class ElementDragger<T extends IDragableElement> implements IElementDragger {


    private dragging = false;
    private mouseDownPositionX = 0;
    private mouseDownPositionY = 0;
    private elementOriginalLeft = 0;
    private elementOriginalTop = 0;
    private sprite: T;
    
    private selectSpriteM: (s: T) => void;
    private onDragging: (((s: IElementDragger) => void) | null);
    private onEndDraging: (((s: IElementDragger) => void) | null);
    private elementId: string = "";
    public element: HTMLElement;
    public StartXOffset: number = 0;
    public StartYOffset: number = 0;
    public spriteG: any;

    constructor(element, sprite: T, selectSpriteM: (s: T) => void, onDragging: (((s: IElementDragger) => void) | null) = null, onEndDraging: (((s: IElementDragger) => void) | null) = null) {
        this.dragging = false;
        this.mouseDownPositionX = 0;
        this.mouseDownPositionY = 0;
        this.elementOriginalLeft = 0;
        this.elementOriginalTop = 0;
        this.element = element;
        this.elementId = element !=  null? element.id: "";
        this.sprite = sprite;
        this.spriteG = sprite;
        this.selectSpriteM = selectSpriteM;
        this.onDragging = onDragging;
        this.onEndDraging = onEndDraging;
        if (element == null) return;
        this.element.onmousedown = e => this.startDrag(e);
        this.element.onmouseup = e => this.stopDrag(e);
        window.addEventListener('onmousedown', d => this.unsetMouseMove());
        window.addEventListener('onmouseup', d => this.stopDrag(d));
    }

    private startDrag(e) {
        console.info("startDrag", this.element.className);
        if (this.dragging) return;
        this.dragging = true;
        this.mouseDownPositionX = e.clientX;
        this.mouseDownPositionY = e.clientY;
        this.elementOriginalLeft = parseInt(this.element.style.left);
        this.elementOriginalTop = parseInt(this.element.style.top);
        // set mousemove event
        window.addEventListener('mousemove', d => this.dragElement(d));
        this.selectSpriteM(this.sprite);
        e.preventDefault();
    }

    private unsetMouseMove() {
        // unset mousemove event
        window.removeEventListener('mousemove', d => this.dragElement(d));
        window.removeEventListener('onmouseup', d => this.stopDrag(d));
        if (this.element == null) return;
        console.info("clearDrag", this.element.className);
    }
    private stopDrag(e) {
        console.info("stopDrag", this.element.className);
        this.dragging = false;
        this.unsetMouseMove();
        if (this.onEndDraging != null)
            this.onEndDraging(this);
        e.preventDefault();
    }
    private dragElement(e) {
        if (!this.dragging)
            return;
        e.preventDefault();
        // move element
        this.sprite.X = this.elementOriginalLeft + (e.clientX - this.mouseDownPositionX);
        this.sprite.Y = this.elementOriginalTop + (e.clientY - this.mouseDownPositionY);
        this.element.style.left = this.sprite.X + 'px';
        this.element.style.top = this.sprite.Y + 'px';
        if (this.onDragging != null)
            this.onDragging(this);
    }
    public UpdateSprite(sprite: T) {
        this.sprite = sprite;
    }

    public ResetStartPos(x: number | null = null, y: number | null = null) {
        this.element.style.left = (x != null ? x: this.elementOriginalLeft)+'px';
        this.element.style.top = (y != null ? y: this.elementOriginalTop ) + 'px';
    }

    public Dispose() {
        this.unsetMouseMove();
    }
}

