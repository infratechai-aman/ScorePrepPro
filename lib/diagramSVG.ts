/**
 * diagramSVG.ts
 * 
 * Generates inline SVG diagrams for Mathematics questions.
 * Covers all common Indian board exam geometry figures.
 * 
 * AI outputs diagram tags like: [FIG: right_triangle | A=top B=bottom-left C=bottom-right AB=3cm BC=4cm right=B]
 * This module parses those tags and returns clean inline SVG.
 */

/** Parse key=value pairs from a param string */
function parseParams(paramStr: string): Record<string, string> {
    const result: Record<string, string> = {};
    const parts = paramStr.split(/\s+/);
    for (const part of parts) {
        const eqIdx = part.indexOf('=');
        if (eqIdx > 0) {
            result[part.slice(0, eqIdx).trim().toLowerCase()] = part.slice(eqIdx + 1).trim();
        }
    }
    return result;
}

/** Wrap SVG content in a properly sized viewBox */
function svg(width: number, height: number, content: string, extra = ''): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display:block;margin:8px auto;font-family:Georgia,serif;" ${extra}>${content}</svg>`;
}

function textEl(x: number, y: number, text: string, opts: {size?: number, bold?: boolean, anchor?: string} = {}): string {
    const size = opts.size || 11;
    const weight = opts.bold ? 'bold' : 'normal';
    const anchor = opts.anchor || 'middle';
    return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="#1a1a1a">${text}</text>`;
}

function line(x1: number, y1: number, x2: number, y2: number, stroke = '#1a1a1a', strokeWidth = 1.5): string {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
}

function circle(cx: number, cy: number, r: number, fill = 'none', stroke = '#1a1a1a'): string {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
}

function rightAngleMark(x: number, y: number, dir: 'bl'|'br'|'tl'|'tr' = 'bl', size = 10): string {
    const s = size;
    const marks: Record<string, string> = {
        bl: `<path d="M${x},${y-s} L${x+s},${y-s} L${x+s},${y}" fill="none" stroke="#1a1a1a" stroke-width="1.2"/>`,
        br: `<path d="M${x},${y-s} L${x-s},${y-s} L${x-s},${y}" fill="none" stroke="#1a1a1a" stroke-width="1.2"/>`,
        tl: `<path d="M${x},${y+s} L${x+s},${y+s} L${x+s},${y}" fill="none" stroke="#1a1a1a" stroke-width="1.2"/>`,
        tr: `<path d="M${x},${y+s} L${x-s},${y+s} L${x-s},${y}" fill="none" stroke="#1a1a1a" stroke-width="1.2"/>`,
    };
    return marks[dir] || marks.bl;
}

function arcAngleMark(cx: number, cy: number, startAngleDeg: number, endAngleDeg: number, r = 16): string {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngleDeg));
    const y1 = cy + r * Math.sin(toRad(startAngleDeg));
    const x2 = cx + r * Math.cos(toRad(endAngleDeg));
    const y2 = cy + r * Math.sin(toRad(endAngleDeg));
    const largeArc = Math.abs(endAngleDeg - startAngleDeg) > 180 ? 1 : 0;
    return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="#555" stroke-width="1.2"/>`;
}

// ─── Diagram Generators ──────────────────────────────────────────────────────

/** Right triangle: B at bottom-left (right angle), C at bottom-right, A at top-left */
function drawRightTriangle(params: Record<string, string>): string {
    const labelA = params['a'] || 'A';
    const labelB = params['b'] || 'B';
    const labelC = params['c'] || 'C';
    const sideAB = params['ab'] || params['height'] || '';
    const sideBC = params['bc'] || params['base'] || '';
    const sideAC = params['ac'] || params['hyp'] || params['hypotenuse'] || '';
    const rightAt = params['right'] || 'b';

    // B bottom-left, C bottom-right, A top-left
    const Bx = 30, By = 150;
    const Cx = 180, Cy = 150;
    const Ax = 30, Ay = 30;

    let content = '';
    // Triangle
    content += `<polygon points="${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}" fill="none" stroke="#1a1a1a" stroke-width="1.8"/>`;
    // Right angle mark at B
    content += rightAngleMark(Bx, By, 'br', 10);

    // Vertex labels
    content += textEl(Ax - 14, Ay + 4, labelA, {size: 12, bold: true});
    content += textEl(Bx - 14, By + 4, labelB, {size: 12, bold: true});
    content += textEl(Cx + 10, Cy + 4, labelC, {size: 12, bold: true});

    // Side labels
    if (sideAB) content += textEl(Ax - 20, (Ay + By) / 2, sideAB, {size: 10, anchor: 'middle'});
    if (sideBC) content += textEl((Bx + Cx) / 2, By + 16, sideBC, {size: 10, anchor: 'middle'});
    if (sideAC) {
        const mx = (Ax + Cx) / 2 + 14;
        const my = (Ay + Cy) / 2;
        content += textEl(mx, my, sideAC, {size: 10, anchor: 'start'});
    }

    return svg(220, 175, content);
}

/** General triangle */
function drawTriangle(params: Record<string, string>): string {
    const labelA = params['a'] || 'A';
    const labelB = params['b'] || 'B';
    const labelC = params['c'] || 'C';
    const sideAB = params['ab'] || params['c_side'] || '';
    const sideBC = params['bc'] || params['a_side'] || '';
    const sideCA = params['ca'] || params['b_side'] || '';
    const angleA = params['angle_a'] || params['anglea'] || '';
    const angleB = params['angle_b'] || params['angleb'] || '';
    const angleC = params['angle_c'] || params['anglec'] || '';

    // A top-center, B bottom-left, C bottom-right
    const Ax = 120, Ay = 20;
    const Bx = 20, By = 160;
    const Cx = 220, Cy = 160;

    let content = '';
    content += `<polygon points="${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}" fill="none" stroke="#1a1a1a" stroke-width="1.8"/>`;

    // Vertex labels
    content += textEl(Ax, Ay - 10, labelA, {size: 12, bold: true});
    content += textEl(Bx - 14, By + 5, labelB, {size: 12, bold: true});
    content += textEl(Cx + 10, Cy + 5, labelC, {size: 12, bold: true});

    // Side labels (midpoints)
    if (sideAB) content += textEl((Ax + Bx) / 2 - 14, (Ay + By) / 2, sideAB, {size: 10, anchor: 'end'});
    if (sideBC) content += textEl((Bx + Cx) / 2, By + 16, sideBC, {size: 10});
    if (sideCA) content += textEl((Cx + Ax) / 2 + 14, (Cy + Ay) / 2, sideCA, {size: 10, anchor: 'start'});

    // Angle labels
    if (angleA) content += textEl(Ax + 16, Ay + 20, angleA, {size: 9});
    if (angleB) content += textEl(Bx + 22, By - 12, angleB, {size: 9});
    if (angleC) content += textEl(Cx - 22, Cy - 12, angleC, {size: 9});

    return svg(250, 185, content);
}

/** Circle with optional chord, tangent, radius */
function drawCircle(params: Record<string, string>): string {
    const centerLabel = params['center'] || params['o'] || 'O';
    const hasRadius = params['radius'] || params['r'];
    const hasTangent = params['tangent'];
    const hasChord = params['chord'];
    const pointsStr = params['points'] || '';

    const cx = 120, cy = 110, r = 80;
    let content = '';

    content += circle(cx, cy, r);
    // Center dot
    content += `<circle cx="${cx}" cy="${cy}" r="2.5" fill="#1a1a1a"/>`;
    content += textEl(cx + 6, cy + 4, centerLabel, {size: 11, bold: true});

    if (hasRadius) {
        // Draw radius to top
        content += line(cx, cy, cx, cy - r);
        content += textEl(cx + 6, cy - r / 2, hasRadius, {size: 10, anchor: 'start'});
        content += `<circle cx="${cx}" cy="${cy - r}" r="2" fill="#1a1a1a"/>`;
    }

    if (hasTangent) {
        // Draw tangent at rightmost point
        const tx = cx + r, ty = cy;
        content += `<circle cx="${tx}" cy="${ty}" r="2.5" fill="#1a1a1a"/>`;
        content += line(tx, ty - 55, tx, ty + 55, '#555');
        content += line(cx, cy, tx, ty, '#888'); // radius to tangent point
        content += rightAngleMark(tx, ty, 'bl', 10);
        content += textEl(tx + 10, ty, hasTangent, {size: 10, anchor: 'start'});
    }

    if (hasChord) {
        // Draw chord from top-left to bottom-right area
        const x1 = cx - r * Math.cos(Math.PI / 6);
        const y1 = cy - r * Math.sin(Math.PI / 6);
        const x2 = cx + r * Math.cos(Math.PI / 4);
        const y2 = cy + r * Math.sin(Math.PI / 4);
        content += line(x1, y1, x2, y2, '#555');
        const parts = hasChord.split(',');
        if (parts[0]) content += textEl(x1 - 10, y1 - 5, parts[0].trim(), {size: 10});
        if (parts[1]) content += textEl(x2 + 6, y2 + 5, parts[1].trim(), {size: 10});
    }

    // Extra named points on circle perimeter
    if (pointsStr) {
        const pts = pointsStr.split(',').map(s => s.trim()).filter(Boolean);
        pts.forEach((label, i) => {
            const angle = ((i / pts.length) * 2 * Math.PI) - Math.PI / 2;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            content += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.5" fill="#1a1a1a"/>`;
            const lx = cx + (r + 14) * Math.cos(angle);
            const ly = cy + (r + 14) * Math.sin(angle);
            content += textEl(parseFloat(lx.toFixed(0)), parseFloat(ly.toFixed(0)), label, {size: 10, bold: true});

        });
    }

    return svg(250, 230, content);
}

/** Two parallel lines cut by a transversal */
function drawParallelLines(params: Record<string, string>): string {
    const l1Label = params['line1'] || params['l'] || 'l';
    const l2Label = params['line2'] || params['m'] || 'm';
    const tLabel = params['transversal'] || params['t'] || 't';
    const angle = parseFloat(params['angle'] || '65');

    const rad = (angle * Math.PI) / 180;
    const y1 = 50, y2 = 150;
    const xLeft = 20, xRight = 220;

    // Intersection points
    const ix1 = 90 + (y1 - 100) / Math.tan(rad);
    const ix2 = 90 + (y2 - 100) / Math.tan(rad);

    let content = '';
    // Parallel lines
    content += line(xLeft, y1, xRight, y1, '#1a1a1a', 1.8);
    content += line(xLeft, y2, xRight, y2, '#1a1a1a', 1.8);
    // Line labels
    content += textEl(xRight + 10, y1, l1Label, {size: 11, bold: true, anchor: 'start'});
    content += textEl(xRight + 10, y2, l2Label, {size: 11, bold: true, anchor: 'start'});
    // Transversal
    content += line(ix1 - 50 * Math.cos(rad), y1 - 50 * Math.sin(rad),
                    ix2 + 50 * Math.cos(rad), y2 + 50 * Math.sin(rad), '#1a1a1a', 1.8);

    // Angle marks at first intersection
    const angDeg = `${angle}°`;
    content += textEl(ix1 + 14, y1 - 8, angDeg, {size: 10});
    // Alternate angle mark
    content += textEl(ix2 - 30, y2 + 14, angDeg, {size: 10});

    // Arrow marks on parallel lines (to show they're parallel)
    const midX = (xLeft + xRight) / 2;
    content += `<path d="M${midX - 5},${y1} L${midX},${y1 - 5} L${midX + 5},${y1}" fill="none" stroke="#555" stroke-width="1.2"/>`;
    content += `<path d="M${midX - 5},${y2} L${midX},${y2 - 5} L${midX + 5},${y2}" fill="none" stroke="#555" stroke-width="1.2"/>`;

    // Transversal label
    content += textEl(ix1 - 45 * Math.cos(rad) - 10, y1 - 45 * Math.sin(rad), tLabel, {size: 11, bold: true});

    return svg(260, 215, content);
}

/** Single angle between two rays */
function drawAngle(params: Record<string, string>): string {
    const vertex = params['vertex'] || params['v'] || 'O';
    const ray1 = params['ray1'] || params['a'] || 'A';
    const ray2 = params['ray2'] || params['b'] || 'B';
    const measure = params['measure'] || params['angle'] || '60°';

    const ox = 80, oy = 150;
    const len = 110;
    const angleDeg = parseFloat(measure.replace('°', '').replace('deg', '')) || 60;
    const rad = (angleDeg * Math.PI) / 180;

    // Ray 1: horizontal right
    const r1x = ox + len, r1y = oy;
    // Ray 2: at angle
    const r2x = ox + len * Math.cos(rad);
    const r2y = oy - len * Math.sin(rad);

    let content = '';
    content += line(ox, oy, r1x, r1y, '#1a1a1a', 1.8);
    content += line(ox, oy, r2x, r2y, '#1a1a1a', 1.8);
    content += `<circle cx="${ox}" cy="${oy}" r="2.5" fill="#1a1a1a"/>`;

    // Arc angle mark
    content += arcAngleMark(ox, oy, 0, -angleDeg, 22);
    // Measure label
    const midAngle = (-angleDeg / 2) * (Math.PI / 180);
    const lx = ox + 38 * Math.cos(midAngle);
    const ly = oy + 38 * Math.sin(midAngle);
    content += textEl(lx, ly, measure, {size: 10});

    // Labels
    content += textEl(ox - 12, oy + 5, vertex, {size: 12, bold: true});
    content += textEl(r1x + 8, r1y + 4, ray1, {size: 12, bold: true, anchor: 'start'});
    content += textEl(r2x + 6, r2y - 5, ray2, {size: 12, bold: true, anchor: 'start'});

    return svg(230, 195, content);
}

/** Basic coordinate plane */
function drawCoordinatePlane(params: Record<string, string>): string {
    const cx = 100, cy = 100;
    const axisLen = 80;

    let content = '';
    // Axes
    content += line(cx - axisLen, cy, cx + axisLen, cy, '#1a1a1a', 1.5); // x
    content += line(cx, cy + axisLen, cx, cy - axisLen, '#1a1a1a', 1.5); // y
    // Arrows
    content += `<polygon points="${cx + axisLen},${cy} ${cx + axisLen - 7},${cy - 4} ${cx + axisLen - 7},${cy + 4}" fill="#1a1a1a"/>`;
    content += `<polygon points="${cx},${cy - axisLen} ${cx - 4},${cy - axisLen + 7} ${cx + 4},${cy - axisLen + 7}" fill="#1a1a1a"/>`;
    // Axis labels
    content += textEl(cx + axisLen + 10, cy + 4, 'X', {size: 11, bold: true, anchor: 'start'});
    content += textEl(cx + 6, cy - axisLen - 6, 'Y', {size: 11, bold: true});
    content += textEl(cx - 8, cy + 14, 'O', {size: 10});

    // Plot points from params
    const pointsStr = params['points'] || '';
    if (pointsStr) {
        const ptPattern = /\((-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\)/g;
        let match;
        let ptIdx = 0;
        const ptLabels = (params['labels'] || '').split(',');
        while ((match = ptPattern.exec(pointsStr)) !== null) {
            const px = cx + parseFloat(match[1]) * 20;
            const py = cy - parseFloat(match[2]) * 20;
            content += `<circle cx="${px}" cy="${py}" r="3.5" fill="#c00"/>`;
            const lbl = ptLabels[ptIdx]?.trim() || `(${match[1]},${match[2]})`;
            content += textEl(px + 7, py - 6, lbl, {size: 9, anchor: 'start'});
            ptIdx++;
        }
    }

    // Tick marks
    for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        content += line(cx + i * 20, cy - 3, cx + i * 20, cy + 3, '#888');
        content += line(cx - 3, cy - i * 20, cx + 3, cy - i * 20, '#888');
        content += textEl(cx + i * 20, cy + 14, String(i), {size: 8});
        content += textEl(cx - 10, cy - i * 20 + 3, String(i), {size: 8, anchor: 'end'});
    }

    return svg(210, 215, content);
}

/** Number line */
function drawNumberLine(params: Record<string, string>): string {
    const from = parseFloat(params['from'] || '0');
    const to = parseFloat(params['to'] || '10');
    const markedStr = params['mark'] || params['points'] || '';

    const y = 60, xStart = 20, xEnd = 220;
    const range = to - from;
    const scale = (xEnd - xStart) / range;

    let content = '';
    content += line(xStart, y, xEnd, y, '#1a1a1a', 1.8);
    // Arrows
    content += `<polygon points="${xEnd},${y} ${xEnd - 7},${y - 4} ${xEnd - 7},${y + 4}" fill="#1a1a1a"/>`;

    // Ticks and labels
    for (let v = Math.ceil(from); v <= Math.floor(to); v++) {
        const x = xStart + (v - from) * scale;
        content += line(x, y - 6, x, y + 6, '#1a1a1a');
        content += textEl(x, y + 18, String(v), {size: 10});
    }

    // Mark special points
    if (markedStr) {
        markedStr.split(',').forEach(s => {
            const v = parseFloat(s.trim());
            if (!isNaN(v)) {
                const x = xStart + (v - from) * scale;
                content += `<circle cx="${x}" cy="${y}" r="5" fill="#c00" stroke="#fff" stroke-width="1.5"/>`;
            }
        });
    }

    return svg(250, 90, content);
}

/** Main entry point: parse a [FIG: type | params] tag and return SVG */
export function renderFigTag(tag: string): string {
    try {
        // Strip [FIG: ... ] or [DIAGRAM: ... ]
        const inner = tag.replace(/^\[(?:FIG|DIAGRAM|FIGURE|DIAGRAM_SVG):\s*/i, '').replace(/\]$/, '');
        const pipeIdx = inner.indexOf('|');
        const type = (pipeIdx >= 0 ? inner.slice(0, pipeIdx) : inner).trim().toLowerCase().replace(/[-\s]+/g, '_');
        const paramStr = pipeIdx >= 0 ? inner.slice(pipeIdx + 1).trim() : '';
        const params = parseParams(paramStr);

        switch (type) {
            case 'right_triangle':
            case 'right_angle_triangle':
            case 'righttriangle':
                return drawRightTriangle(params);
            case 'triangle':
            case 'general_triangle':
                return drawTriangle(params);
            case 'circle':
            case 'circle_tangent':
            case 'circle_chord':
                return drawCircle(params);
            case 'parallel_lines':
            case 'parallel':
            case 'transversal':
                return drawParallelLines(params);
            case 'angle':
            case 'angles':
                return drawAngle(params);
            case 'coordinate_plane':
            case 'coordinate':
            case 'graph':
            case 'axes':
                return drawCoordinatePlane(params);
            case 'number_line':
            case 'numberline':
                return drawNumberLine(params);
            default:
                // Fallback: blank diagram box with label
                return `<div style="width:200px;height:100px;border:1px dashed #999;display:flex;align-items:center;justify-content:center;margin:6px auto;font-size:10px;color:#666;font-family:Georgia,serif;">[Diagram: ${type}]</div>`;
        }
    } catch {
        return '';
    }
}

/** Replace all [FIG: ...] tags in text with rendered SVGs */
export function replaceFigTags(text: string): string {
    return text.replace(/\[(?:FIG|DIAGRAM|FIGURE):[^\]]+\]/gi, (match) => {
        return renderFigTag(match);
    });
}
