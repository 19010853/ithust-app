"""
plot_benchmark.py
Vẽ biểu đồ so sánh hiệu năng tìm kiếm: Elasticsearch vs MongoDB.
Số liệu lấy từ kết quả k6 load test (100 VU, 5.000 gigs, 270s/kịch bản).

Cách chạy:
    pip install matplotlib numpy
    python benchmark/plot_benchmark.py

Output: benchmark/results/benchmark_chart.png
"""

import os
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

matplotlib.rcParams['font.family'] = 'DejaVu Sans'

# ── Số liệu từ kết quả k6 ────────────────────────────────────────────────────
SCENARIOS = ['Elasticsearch', 'MongoDB\ntext index', 'MongoDB\nregex']
COLORS    = ['#2196F3', '#FF9800', '#F44336']   # xanh, cam, đỏ

DATA = {
    'p50':  [277,  262,  2810],
    'p90':  [489,  733,  4740],
    'p95':  [611, 1060,  5190],
}

THROUGHPUT = [105.75, 78.45, 15.12]   # req/s

THRESHOLD = 5000   # ms — ngưỡng p95 chấp nhận được

# ── Setup figure ─────────────────────────────────────────────────────────────
fig, (ax1, ax2) = plt.subplots(
    1, 2,
    figsize=(13, 6),
    gridspec_kw={'width_ratios': [2, 1]}
)
fig.patch.set_facecolor('#FAFAFA')

# ────────────────────────────────────────────────────────────────────────────
# Biểu đồ 1: Latency (p50 / p90 / p95)
# ────────────────────────────────────────────────────────────────────────────
ax1.set_facecolor('#F5F5F5')
ax1.set_title('Độ trễ phản hồi theo percentile\n(thấp hơn = tốt hơn)',
              fontsize=13, fontweight='bold', pad=14)

n_groups   = len(SCENARIOS)
n_metrics  = len(DATA)
bar_width  = 0.22
x          = np.arange(n_groups)

for i, (label, values) in enumerate(DATA.items()):
    offset = (i - n_metrics / 2 + 0.5) * bar_width
    bars = ax1.bar(
        x + offset, values,
        width=bar_width,
        color=[c for c in COLORS],
        alpha=0.85,
        edgecolor='white',
        linewidth=0.8,
        label=label.upper()
    )
    # Ghi số lên đầu mỗi cột
    for bar, val in zip(bars, values):
        y_pos = bar.get_height() + 60
        label_str = f'{val:,} ms' if val < 1000 else f'{val/1000:.2f}s'
        ax1.text(
            bar.get_x() + bar.get_width() / 2,
            y_pos,
            label_str,
            ha='center', va='bottom',
            fontsize=7.5, fontweight='bold',
            color='#333333'
        )

# Đường ngưỡng p95
ax1.axhline(y=THRESHOLD, color='#B71C1C', linestyle='--', linewidth=1.4, alpha=0.8)
ax1.text(
    n_groups - 0.05, THRESHOLD + 100,
    f'Ngưỡng p95 = {THRESHOLD:,} ms',
    ha='right', va='bottom',
    fontsize=9, color='#B71C1C', fontstyle='italic'
)

ax1.set_xticks(x)
ax1.set_xticklabels(SCENARIOS, fontsize=11)
ax1.set_ylabel('Thời gian phản hồi (ms)', fontsize=11)
ax1.set_ylim(0, 6400)
ax1.yaxis.set_major_formatter(
    matplotlib.ticker.FuncFormatter(lambda v, _: f'{int(v):,}')
)
ax1.grid(axis='y', linestyle='--', alpha=0.5, color='#BDBDBD')
ax1.spines[['top', 'right']].set_visible(False)

# Legend phân vị
legend_patches = [
    mpatches.Patch(color='#555555', alpha=0.5, label='p50 (median)'),
    mpatches.Patch(color='#555555', alpha=0.7, label='p90'),
    mpatches.Patch(color='#555555', alpha=0.9, label='p95'),
]
# Dùng hatch thay color cho legend metric
bar_width_legend = 0.22
metric_labels = list(DATA.keys())
metric_hatches = ['', '///', 'xxx']
legend_handles = []
for lbl, hatch in zip(metric_labels, metric_hatches):
    legend_handles.append(
        mpatches.Patch(facecolor='#9E9E9E', hatch=hatch,
                       edgecolor='white', label=lbl.upper())
    )

# Re-draw bars with hatch to distinguish p50/p90/p95 within same color
ax1.cla()
ax1.set_facecolor('#F5F5F5')
ax1.set_title('Độ trễ phản hồi theo percentile\n(thấp hơn = tốt hơn)',
              fontsize=13, fontweight='bold', pad=14)

hatches = ['', '///', 'xxx']
for i, (metric, values) in enumerate(DATA.items()):
    offset = (i - n_metrics / 2 + 0.5) * bar_width
    for j, (val, color) in enumerate(zip(values, COLORS)):
        bar = ax1.bar(
            x[j] + offset, val,
            width=bar_width,
            color=color,
            alpha=[0.55, 0.75, 0.95][i],
            hatch=hatches[i],
            edgecolor='white',
            linewidth=0.6
        )
        label_str = f'{val:,}' if val < 1000 else f'{val/1000:.2f}s'
        ax1.text(
            x[j] + offset,
            val + 90,
            label_str,
            ha='center', va='bottom',
            fontsize=7, fontweight='bold',
            color='#333333'
        )

ax1.axhline(y=THRESHOLD, color='#B71C1C', linestyle='--', linewidth=1.4, alpha=0.8)
ax1.text(
    n_groups - 0.05, THRESHOLD + 110,
    f'Ngưỡng p95 = {THRESHOLD:,} ms',
    ha='right', va='bottom',
    fontsize=9, color='#B71C1C', fontstyle='italic'
)
ax1.set_xticks(x)
ax1.set_xticklabels(SCENARIOS, fontsize=11)
ax1.set_ylabel('Thời gian phản hồi (ms)', fontsize=11)
ax1.set_ylim(0, 6400)
ax1.yaxis.set_major_formatter(
    matplotlib.ticker.FuncFormatter(lambda v, _: f'{int(v):,}')
)
ax1.grid(axis='y', linestyle='--', alpha=0.5, color='#BDBDBD')
ax1.spines[['top', 'right']].set_visible(False)

metric_legend = [
    mpatches.Patch(facecolor='#9E9E9E', alpha=0.55, label='p50 (median)'),
    mpatches.Patch(facecolor='#9E9E9E', alpha=0.75, hatch='///', label='p90'),
    mpatches.Patch(facecolor='#9E9E9E', alpha=0.95, hatch='xxx', label='p95'),
]
ax1.legend(handles=metric_legend, loc='upper left', fontsize=9, framealpha=0.8)

# ────────────────────────────────────────────────────────────────────────────
# Biểu đồ 2: Throughput (req/s)
# ────────────────────────────────────────────────────────────────────────────
ax2.set_facecolor('#F5F5F5')
ax2.set_title('Thông lượng (Throughput)\n(cao hơn = tốt hơn)',
              fontsize=13, fontweight='bold', pad=14)

bars2 = ax2.barh(
    SCENARIOS[::-1],
    THROUGHPUT[::-1],
    color=COLORS[::-1],
    alpha=0.85,
    edgecolor='white',
    linewidth=0.8,
    height=0.45
)

for bar, val in zip(bars2, THROUGHPUT[::-1]):
    ax2.text(
        val + 1.5,
        bar.get_y() + bar.get_height() / 2,
        f'{val:.2f} req/s',
        va='center', ha='left',
        fontsize=10, fontweight='bold',
        color='#333333'
    )

ax2.set_xlabel('Requests / giây', fontsize=11)
ax2.set_xlim(0, 130)
ax2.grid(axis='x', linestyle='--', alpha=0.5, color='#BDBDBD')
ax2.spines[['top', 'right']].set_visible(False)
ax2.tick_params(axis='y', labelsize=11)

# ── Caption & layout ─────────────────────────────────────────────────────────
fig.suptitle(
    'So sánh hiệu năng tìm kiếm: Elasticsearch vs MongoDB\n'
    'k6 Load Test · 100 VU đồng thời · 5.000 gigs · 270s/kịch bản',
    fontsize=12, y=1.01, color='#424242'
)
plt.tight_layout(pad=2.0)

# ── Lưu file ─────────────────────────────────────────────────────────────────
out_dir = os.path.join(os.path.dirname(__file__), 'results')
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'benchmark_chart.png')
plt.savefig(out_path, dpi=200, bbox_inches='tight', facecolor=fig.get_facecolor())
print(f'\n✅  Đã lưu biểu đồ: {out_path}\n')
plt.show()
