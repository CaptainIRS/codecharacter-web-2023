import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import Phaser from 'phaser';
import { events } from './events/EventEmitter.js';
import { TileMap } from './scenes/TileMap.js';

@customElement('cc-map-designer')
export class MapDesigner extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 99%;
      width: 99%;
    }
  `;

  private _game!: Phaser.Game;

  firstUpdated(): void {
    this._game = new Phaser.Game({
      type: Phaser.AUTO,
      parent:
        this.shadowRoot?.querySelector<HTMLElement>('#map-designer') ??
        undefined,
      scene: [TileMap],
      scale: {
        mode: Phaser.Scale.RESIZE,
        parent:
          this.shadowRoot?.querySelector<HTMLElement>('#map-designer') ??
          undefined,
        width: '100%',
        height: '100%',
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      fps: {
        min: 10,
        target: 30,
        smoothStep: true,
      },
    });
  }

  disconnectedCallback(): void {
    events.removeAllListeners();
    this._game.scene.getScene('TileMap').events.removeAllListeners();
    this._game.destroy(true);
  }

  render(): TemplateResult {
    return html` <div id="map-designer"></div> `;
  }
}
