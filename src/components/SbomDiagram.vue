<template>
  <div>
    <input type="file" @change="onFileSelected" />
  </div>
  <div ref="diagram" style="width: auto; height: 500px"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import * as echarts from 'echarts';
  import * as dagre from 'dagre';
  //import { GoModGraph } from '@/types/gomodgraph';
  import { Spdx } from '@/types/spdx';

  // The data model for the SBOM diagram in ECharts tree format
  // https://echarts.apache.org/en/option.html#series-tree.data
  let model: any;

  let chart: echarts.ECharts;

  const diagram = ref<HTMLElement>();

  function onFileSelected(event: Event) {
    const el = event.target as HTMLInputElement;

    if (!el.files?.length) {
      console.log('No file selected');
      return;
    }

    // Pick the first file if multiple files are selected.
    const file: File = el.files[0];
    console.log('Selected file:', file.name);

    fetch(file.name).then((response) => {
      response.text().then((text) => {
        //const doc = new GoModGraph();
        //doc.parse(text);
        const doc = new Spdx();
        doc.parseTagValue(text);

        const dag = new dagre.graphlib.Graph();
        dag.setGraph({});
        dag.setDefaultEdgeLabel(function () {
          return {};
        });

        doc.getPackages().forEach((p) => {
          dag.setNode(p.id, { label: p.name, width: 100, height: 300 });
        });
        doc.getRelationships().forEach((r) => {
          dag.setEdge(r.source.id, r.target.id);
        });

        dagre.layout(dag);

        chart = echarts.init(diagram.value);
        chart.setOption({
          series: [
            {
              type: 'graph',
              layout: 'none',
              roam: true,
              data: dag.nodes().map((v) => {
                const node = dag.node(v);
                return {
                  id: v,
                  name: node.label,
                  x: node.x,
                  y: node.y,
                  symbol: 'emptyCircle',
                  symbolSize: 10,
                  itemStyle: {
                    color: '#404040',
                  },
                };
              }),
              links: dag.edges().map((e) => {
                return {
                  source: e.v,
                  target: e.w,
                  label: e.v + ' -> ' + e.w,
                  lineStyle: {
                    color: '#a0a0a0',
                  },
                };
              }),
              label: {
                position: 'right',
                formatter: '{b}',
              },

              emphasis: {
                focus: 'adjacency',
                lineStyle: {
                  width: 10,
                },
              },
            },
          ],
        });
      });
    });
  }
</script>
