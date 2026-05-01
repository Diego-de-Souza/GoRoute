import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import type { Network } from 'vis-network';
import { CAREER_EDGES, CAREER_NODES, careerNetworkOptions } from './career-graph.config';
import { SideMenu } from '../../components/side-menu/side-menu';

@Component({
  selector: 'app-home',
  imports: [SideMenu],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('networkHost', { read: ElementRef }) private readonly networkHost?: ElementRef<HTMLElement>;

  private network?: Network;
  private teardown = false;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const container = this.networkHost?.nativeElement;
    if (!container) {
      return;
    }

    void import('vis-network/standalone').then(({ Network: VisNetwork, DataSet }) => {
      if (this.teardown) {
        return;
      }
      const nodes = new DataSet(CAREER_NODES);
      const edges = new DataSet(CAREER_EDGES);
      const net = new VisNetwork(container, { nodes, edges }, careerNetworkOptions);
      this.network = net;

      const stopPhysics = (): void => {
        net.setOptions({ physics: false });
      };

      const fit = (): void => {
        if (this.teardown) {
          return;
        }
        net.fit({ animation: false });
      };

      net.once('stabilizationIterationsDone', () => {
        stopPhysics();
        fit();
      });

      window.setTimeout(() => {
        if (!this.teardown) {
          stopPhysics();
          fit();
        }
      }, 4500);

      this.resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(fit);
      });
      this.resizeObserver.observe(container);
    });
  }

  ngOnDestroy(): void {
    this.teardown = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.network?.destroy();
    this.network = undefined;
  }
}
