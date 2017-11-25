/*tslint:disable*/
import {
  Component, Input, Output, EventEmitter, ElementRef, ViewChildren, QueryList,
  ViewEncapsulation, ViewChild, Renderer2, AfterViewInit, OnDestroy
} from '@angular/core';
import { Platform, DomController } from 'ionic-angular';
import { SuperTabsPanGesture } from '../super-tabs-pan-gesture';
import { SuperTabsConfig } from './super-tabs';
import { SuperTabButton } from "./super-tab-button";
import { trigger, style, state, transition, animate } from '@angular/animations';

@Component({
  selector: 'super-tabs-toolbar',
  template: `
    <ion-toolbar [color]="color" mode="md" [class.scroll-tabs]="scrollTabs">
      <div class="tab-buttons-container" #tabButtonsContainer>
        <div *ngIf="tabsPlacement === 'bottom'" class="indicator {{ 'button-md-' + indicatorColor }}" #indicator></div>
        <div class="tab-buttons" #tabButtons>
          <super-tab-button *ngFor="let tab of tabs; let i = index" (select)="selectedTab !== i && onTabSelect(i)" [title]="tab.title" [icon]="tab.icon" [badge]="tab.badge" [selected]="selectedTab === i" [color]="tabsColor" [badgeColor]="badgeColor"></super-tab-button>
        </div>
        <div *ngIf="tabsPlacement === 'top'" class="indicator {{ 'button-md-' + indicatorColor }}" #indicator></div>
      </div>
    </ion-toolbar>
    <div *ngIf="addArrow" class="arrow-down" (click)="togglePanel()">
      <ion-icon style="transform: scale(2);" name="ios-arrow-down"></ion-icon>
    </div>
    <div class="panel" *ngIf="addArrow" [style.width]="screenWidth" [@toggleState]="toggleState">
      <div padding-horizontal>
        <ion-picker id="picker_parent_installType" (resultValue)="getInstallType($event)" name="installType" [items]="filterObj.installType" [tabCurIndex]="selectedTab" required></ion-picker>
        <ion-picker id="picker_parent_taskStatus" (resultValue)="getTaskStatus($event)" name="taskStatus" [items]="filterObj.taskStatus" [tabCurIndex]="selectedTab" required></ion-picker>
        <ion-picker id="picker_parent_taskTime" (resultValue)="getTaskTime($event)" name="taskTime" [items]="filterObj.taskTime" [tabCurIndex]="selectedTab" required></ion-picker>
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('toggleState', [
      state('in', style({
        top: '0px',
        height: 'auto',
        opacity: '1'
      })),
      state('out', style({
        top: '-120px',
        height: '0px',
        opacity: '0'
      })),
      transition('out => in', animate('300ms ease-in')),
      transition('in => out', animate('300ms ease-out'))
    ]),
    trigger('toggleHeight', [
      state('in', style({
        top: '120px'
      })),
      state('out', style({
        top: '0px'
      })),
      transition('out => in', animate('300ms ease-in')),
      transition('in => out', animate('300ms ease-out'))
    ]),
  ]
})
export class SuperTabsToolbar implements AfterViewInit, OnDestroy {

  //搜索框下拉箭头
  @Input()
  addArrow: boolean;
  // 搜索对象
  @Input()
  filterObj: any = {};
  // 视口宽度
  screenWidth: string = document.documentElement.offsetWidth + 'px';
  // 动画内容start
  toggleState = 'out';
  toggle: boolean = true;

  @Input()
  color: string = '';

  @Input()
  tabsColor: string = '';

  @Input()
  badgeColor: string = '';

  @Input()
  scrollTabs: boolean = false;

  @Input()
  indicatorColor: string = '';

  @Input()
  selectedTab: number = 0;

  @Input()
  config: SuperTabsConfig;

  @Input()
  tabsPlacement: string;

  indicatorPosition: number = 0;

  indicatorWidth: number = 0;

  @Output()
  tabSelect: EventEmitter<any> = new EventEmitter<any>();

  @ViewChildren(SuperTabButton)
  private tabButtons: QueryList<SuperTabButton>;

  @ViewChild('tabButtonsContainer')
  private tabButtonsContainer: ElementRef;

  @ViewChild('indicator')
  private indicator: ElementRef;

  @ViewChild('tabButtons')
  private tabButtonsBar: ElementRef;

  /**
   * @private
   */
  segmentPosition: number = 0;

  /**
   * The width of each button
   */
  segmentButtonWidths: number[] = [];

  /**
   * The segment width
   */
  segmentWidth: number = 0;

  tabs: any[] = [];

  private gesture: SuperTabsPanGesture;

  private animationState = {
    indicator: false,
    segment: false
  };

  constructor(
    private el: ElementRef,
    private plt: Platform,
    private rnd: Renderer2,
    private domCtrl: DomController
  ) { }

  ngAfterViewInit() {
    this.gesture = new SuperTabsPanGesture(this.plt, this.tabButtonsContainer.nativeElement, this.config, this.rnd);
    this.gesture.onMove = (delta: number) => {

      let newCPos = this.segmentPosition + delta;

      let mw: number = this.el.nativeElement.offsetWidth,
        cw: number = this.segmentWidth;

      newCPos = Math.max(0, Math.min(newCPos, cw - mw));
      this.setSegmentPosition(newCPos);

    };

    if (this.scrollTabs) {
      this.plt.timeout(() => {
        this.indexSegmentButtonWidths();
      }, 10);
    }
  }

  ngOnDestroy() {
    this.gesture && this.gesture.destroy();
  }

  onTabSelect(index: number) {
    this.tabSelect.emit(index);
  }

  alignIndicator(position: number, width: number, animate?: boolean) {
    this.setIndicatorProperties(width, position, animate);
  }

  setIndicatorPosition(position: number, animate?: boolean) {
    this.setIndicatorProperties(this.indicatorWidth, position, animate);
  }

  setIndicatorWidth(width: number, animate?: boolean) {
    this.setIndicatorProperties(width, this.indicatorPosition, animate);
  }

  setIndicatorProperties(width: number, position: number, animate?: boolean) {
    /**
     * create by huxiubin
     * 控制下拉箭头占位影响下划线长度不均，基数可以设置为默认0.1*1/选项卡数量
     */
    let arrowWidth = this.addArrow ? document.documentElement.offsetWidth * 0.1 * 0.33 : 0;
    let scale = this.addArrow ? (width - arrowWidth) / 100 : width / 100;
    this.indicatorWidth = width;
    this.indicatorPosition = position;
    // const scale = width / 100;
    this.toggleAnimation('indicator', animate);
    this.rnd.setStyle(this.indicator.nativeElement, this.plt.Css.transform, 'translate3d(' + (position - this.segmentPosition) + 'px, 0, 0) scale3d(' + scale + ', 1, 1)')
  }

  setSegmentPosition(position: number, animate?: boolean) {
    this.segmentPosition = position;
    this.toggleAnimation('segment', animate);
    this.rnd.setStyle(this.tabButtonsBar.nativeElement, this.plt.Css.transform, `translate3d(${-1 * position}px,0,0)`);
    this.setIndicatorPosition(this.indicatorPosition, animate);
  }


  /**
   * Enables/disables animation
   * @param el
   * @param animate
   */
  private toggleAnimation(el: 'indicator' | 'segment', animate: boolean) {

    if (!this.config || this.config.transitionDuration === 0)
      return;

    // only change style if the value changed
    if (this.animationState[el] === animate) return;

    this.animationState[el] = animate;

    const _el: HTMLElement = el === 'indicator' ? this.indicator.nativeElement : this.tabButtonsBar.nativeElement;
    const value: string = animate ? `all ${this.config.transitionDuration}ms ${this.config.transitionEase}` : 'initial';

    this.rnd.setStyle(_el, this.plt.Css.transition, value);

  }

  /**
   * Indexes the segment button widths
   */
  indexSegmentButtonWidths() {
    let index = [], total = 0;

    this.tabButtons.forEach((btn: SuperTabButton, i: number) => {
      index[i] = btn.getNativeElement().offsetWidth;
      total += index[i];
    });

    this.segmentButtonWidths = index;
    this.segmentWidth = total;
  }

  /**
   * 筛选条件切换窗口
   */
  togglePanel() {
    this.toggle = !this.toggle;
    this.toggleState = this.toggle ? 'out' : 'in';
  }

  /**
   *
   * @param event 任务类型
   */
  getInstallType(event: string) {
    window['epInstance'].emit('search_list_screen', event);
  }

  /**
   *
   * @param event 任务状态
   */
  getTaskStatus(event: string) {
    window['epInstance'].emit('search_list_saveStatu', event);
  }

  /**
   *
   * @param event 任务时间
   */
  getTaskTime(event: string) {
    window['epInstance'].emit('search_list_time', event);
  }
}
