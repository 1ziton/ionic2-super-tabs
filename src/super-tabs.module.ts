/*tslint:disable*/
import { NgModule, ModuleWithProviders } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SuperTab } from './components/super-tab';
import { SuperTabs } from './components/super-tabs';
import { SuperTabsController } from './providers/super-tabs-controller';
import { SuperTabsToolbar } from './components/super-tabs-toolbar';
import { SuperTabsContainer } from './components/super-tabs-container';
import { SuperTabButton } from './components/super-tab-button';
import { IonPickerModule } from "../../ion-picker/ion-picker";
import { ComponentModule } from "../../component.module";

@NgModule({
  declarations: [
    SuperTab,
    SuperTabs,
    SuperTabsToolbar,
    SuperTabsContainer,
    SuperTabButton
  ],
  imports: [
    IonicModule,
    IonPickerModule,
    ComponentModule
  ],
  exports: [
    SuperTab,
    SuperTabs
  ]
})
export class SuperTabsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SuperTabsModule,
      providers: [
        SuperTabsController
      ]
    };
  }
}
