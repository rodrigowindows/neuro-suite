"""Gera CrewVitals-Demo.pptx e CrewVitals-Demo.pdf a partir do mesmo conteudo.

Uso:
    python gerar_apresentacao.py

Dependencias: python-pptx (PPTX) e Google Chrome / Edge instalado (PDF, modo headless).
Para apontar outro executavel do Chrome, defina a variavel de ambiente CHROME_PATH.
"""

from __future__ import annotations

import html
import os
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

OUT_DIR = Path(__file__).resolve().parent
PPTX_PATH = OUT_DIR / "CrewVitals-Demo.pptx"
PDF_PATH = OUT_DIR / "CrewVitals-Demo.pdf"

SLIDE_W_IN = 13.333
SLIDE_H_IN = 7.5
FONT = "Calibri"

BG = "0F1B2D"
PANEL = "18283F"
HEADER_FILL = "24406A"
TEXT = "F2F5F9"
MUTED = "B8C4D6"
ACCENT = "2EC4B6"
WARN = "F4A261"

CHROME_CANDIDATES = (
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
)


@dataclass(frozen=True)
class Slide:
    kind: str  # cover | bullets | cards | table | closing
    title: str
    subtitle: str = ""
    items: tuple[str, ...] = ()
    cards: tuple[tuple[str, str], ...] = ()
    headers: tuple[str, ...] = ()
    rows: tuple[tuple[str, ...], ...] = ()
    widths: tuple[float, ...] = ()
    note: str = ""


SLIDES: tuple[Slide, ...] = (
    # Slide 1: Titulo
    Slide(
        kind="cover",
        title="CrewVitals",
        subtitle="Terminal de Telemetria de Saude da Tripulacao",
        note="Sistema de Suporte a Decisao (DSS) para monitoramento de prontidao em missoes espaciais",
    ),
    # Slide 2: Introducao
    Slide(
        kind="bullets",
        title="O problema: fadiga cognitiva em voos de longa duracao",
        items=(
            "Missoes espaciais de longa duracao expoem tripulantes a isolamento, confinamento e sobrecarga operacional continua.",
            "Condicoes extremas degradam vigilancia, tempo de reacao e prontidao cognitiva de maneira gradual e assintomatica.",
            "A pergunta operacional critica: o tripulante esta realmente apto para assumir o turno com seguranca?",
            "O CrewVitals torna variacoes de prontidao visiveis precocemente para apoiar a tomada de decisao autonoma a bordo.",
        ),
    ),
    # Slide 3: Solucao
    Slide(
        kind="cards",
        title="Solucao: cockpit operacional de 3 niveis",
        cards=(
            (
                "1. Semaforo operacional",
                "Veredito imediato de prontidao em 3 estados: GO (apto), ATENCAO (vigilancia) ou NO-GO (nao apto).",
            ),
            (
                "2. Tres numeros essenciais",
                "BioScore global (0 a 100), estimativa de variabilidade cardiaca (HRV em ms) e taxa de piscadas (piscadas/min inteiras).",
            ),
            (
                "3. Acao primaria unica",
                "Recomendacao direta e focada (ex.: protocolo respiratorio guiado 4-7-8) para resposta rapida sem sobrecarga cognitiva.",
            ),
        ),
        note="Interface concebida para tomada de decisao rapida sob alta carga cognitiva.",
    ),
    # Slide 4: Demonstracao
    Slide(
        kind="table",
        title="Demonstracao: roteiro operacional em 3 etapas",
        headers=("Etapa", "Estado e Veredito", "Acao Operacional na Demonstracao"),
        rows=(
            (
                "Etapa 1: Abertura",
                "NO-GO — Nao Apto (BioScore 34, HRV 38 ms, 26 piscadas/min)",
                "Acesso direto a rota publica /demo com selo DEMO; deteccao de fadiga severa e indicacao de contramedida.",
            ),
            (
                "Acao: Protocolo",
                "Transicao de estado com contramedida respiratoria guiada",
                "Execucao do Protocolo 4-7-8 e registro da acao pelo tripulante para iniciar a recuperacao.",
            ),
            (
                "Etapa 2: Recuperacao",
                "ATENCAO — Vigilancia (BioScore 52, HRV 48 ms, 20 piscadas/min)",
                "Veredito atualizado para vigilancia moderada; cockpit indica nova verificacao fisiologica.",
            ),
            (
                "Etapa 3: Estabilizacao",
                "GO — Apto para o Turno (BioScore 72, HRV 62 ms, 14 piscadas/min)",
                "Clique em 'Simular novo scan'; parametros normalizados e tripulante liberado para o turno.",
            ),
        ),
        widths=(2.2, 4.6, 5.3),
        note="Demonstracao interativa publica baseada em cenario controlado com valores fixos predeterminados.",
    ),
    # Slide 5: Transparencia Cientifica
    Slide(
        kind="table",
        title="Transparencia cientifica: medido versus simulado",
        headers=("Indicador / Recurso", "Classificacao na Demo", "Fonte e Limitacoes Operacionais"),
        rows=(
            ("Demonstracao publica (/demo)", "100% Simulado", "Valores fixos (BioScore 34, 52 e 72); execucao local sem chamadas ao backend."),
            ("Alerta preditivo", "Demonstracao", "Alerta ilustrativo rotulado; nao constitui modelo preditivo ou prognostico validado."),
            ("Fadiga e piscadas (App)", "Estimativa", "Contagem por visao computacional via webcam; exibicao em piscadas/min inteiras."),
            ("Variacao cardiaca (HRV)", "Estimativa", "rPPG optico experimental por webcam; sem certificacao clinica para diagnostico."),
            ("Sono e humor", "Autorrelatado", "Check-in subjetivo de horas dormidas, percepcao de estresse e prontidao reportada."),
            ("Ambiente e radiacao", "Nao coberto", "Sem integracao com dosimetros a bordo; reservado para telemetria futura de cabine."),
        ),
        widths=(3.1, 2.2, 6.8),
        note="O CrewVitals e um Sistema de Suporte a Decisao (DSS) operacional e nao substitui avaliacao medica profissional.",
    ),
    # Slide 6: Privacidade e Seguranca
    Slide(
        kind="bullets",
        title="Privacidade e seguranca da telemetria",
        items=(
            "Demonstracao publica isolada: execucao estritamente local no navegador, sem chamadas de rede e sem sessao.",
            "Zero persistencia na demo: nenhuma telemetria, video de webcam ou dado fisiologico e transmitido ou salvo em banco.",
            "Arquitetura do sistema operacional: politicas de seguranca RLS no banco de dados isolando telemetria por identificador.",
            "Funcoes e consultas protegidas: autenticacao por token nos servicos de retaguarda e leitura estrita com colunas explicitas.",
            "Higiene de telemetria: logs de console suprimidos em producao para evitar vazamento local de metricas biometricas.",
        ),
    ),
    # Slide 7: Fechamento
    Slide(
        kind="closing",
        title="CrewVitals — Terminal de Telemetria",
        subtitle="Apoio a decisao para a tripulacao em missoes espaciais",
        items=(
            "Demonstracao publica direta (sem login): https://neuro-suite.lovable.app/demo",
            "Codigo-fonte e documentacao: https://github.com/rodrigowindows/neuro-suite",
            "Sistema de Suporte a Decisao (DSS) operacional. Nao substitui avaliacao medica.",
        ),
    ),
)


# ---------------------------------------------------------------- PPTX

def rgb(hex_color: str) -> RGBColor:
    return RGBColor.from_string(hex_color)


def write_paragraph(
    paragraph,
    text: str,
    size: int,
    color: str,
    *,
    bold: bool = False,
    align: PP_ALIGN = PP_ALIGN.LEFT,
    space_after: int = 0,
) -> None:
    paragraph.alignment = align
    paragraph.space_after = Pt(space_after)
    run = paragraph.add_run()
    run.text = text
    run.font.name = FONT
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = rgb(color)


def add_textbox(slide, x: float, y: float, w: float, h: float, anchor=MSO_ANCHOR.TOP):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    frame = box.text_frame
    frame.word_wrap = True
    frame.vertical_anchor = anchor
    return frame


def pptx_background(slide) -> None:
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = rgb(BG)


def pptx_title(slide, title: str) -> None:
    frame = add_textbox(slide, 0.6, 0.4, 12.1, 0.9, anchor=MSO_ANCHOR.BOTTOM)
    write_paragraph(frame.paragraphs[0], title, 32, TEXT, bold=True)
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(1.36), Inches(1.2), Inches(0.06))
    bar.fill.solid()
    bar.fill.fore_color.rgb = rgb(ACCENT)
    bar.line.fill.background()


def pptx_footer(slide, number: int) -> None:
    frame = add_textbox(slide, 0.6, 6.95, 9.0, 0.4)
    write_paragraph(frame.paragraphs[0], "CrewVitals | Demonstracao Operacional", 14, MUTED)
    frame = add_textbox(slide, 11.7, 6.95, 1.0, 0.4)
    write_paragraph(frame.paragraphs[0], str(number), 14, MUTED, align=PP_ALIGN.RIGHT)


def pptx_note(slide, text: str, y: float = 6.35) -> None:
    frame = add_textbox(slide, 0.6, y, 12.1, 0.45)
    write_paragraph(frame.paragraphs[0], text, 14, WARN)


def pptx_cover(slide, item: Slide) -> None:
    frame = add_textbox(slide, 0.9, 1.9, 11.5, 1.3, anchor=MSO_ANCHOR.BOTTOM)
    write_paragraph(frame.paragraphs[0], item.title, 60, TEXT, bold=True)
    frame = add_textbox(slide, 0.9, 3.35, 11.5, 0.8)
    write_paragraph(frame.paragraphs[0], item.subtitle, 28, ACCENT)
    frame = add_textbox(slide, 0.9, 4.35, 11.5, 0.6)
    write_paragraph(frame.paragraphs[0], item.note, 18, MUTED)


def pptx_bullets(slide, item: Slide) -> None:
    frame = add_textbox(slide, 0.6, 1.8, 12.1, 4.8)
    for index, text in enumerate(item.items):
        paragraph = frame.paragraphs[0] if index == 0 else frame.add_paragraph()
        write_paragraph(paragraph, f"\u2022  {text}", 21, TEXT, space_after=16)


def pptx_cards(slide, item: Slide) -> None:
    card_count = len(item.cards)
    card_w = 3.83
    card_h = 3.8 if card_count <= 3 else 2.1
    gap_x, gap_y = 0.3, 0.3
    for index, (head, body) in enumerate(item.cards):
        col, row = index % 3, index // 3
        x = 0.6 + col * (card_w + gap_x)
        y = 1.7 + row * (card_h + gap_y)
        card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(card_w), Inches(card_h))
        card.fill.solid()
        card.fill.fore_color.rgb = rgb(PANEL)
        card.line.fill.background()
        frame = card.text_frame
        frame.word_wrap = True
        frame.vertical_anchor = MSO_ANCHOR.TOP
        frame.margin_left = frame.margin_right = Inches(0.25)
        frame.margin_top = Inches(0.25)
        write_paragraph(frame.paragraphs[0], head, 22, ACCENT, bold=True, space_after=12)
        write_paragraph(frame.add_paragraph(), body, 17, TEXT)


def pptx_table(slide, item: Slide) -> None:
    rows, cols = len(item.rows) + 1, len(item.headers)
    body_size = 14
    shape = slide.shapes.add_table(rows, cols, Inches(0.6), Inches(1.65), Inches(sum(item.widths)), Inches(0.5 * rows))
    table = shape.table
    table.first_row = True
    table.horz_banding = False
    for col, width in enumerate(item.widths):
        table.columns[col].width = Inches(width)

    def style(cell, text: str, *, bold: bool, color: str, fill: str) -> None:
        cell.fill.solid()
        cell.fill.fore_color.rgb = rgb(fill)
        cell.vertical_anchor = MSO_ANCHOR.MIDDLE
        cell.margin_left = cell.margin_right = Inches(0.12)
        cell.margin_top = cell.margin_bottom = Inches(0.06)
        frame = cell.text_frame
        frame.word_wrap = True
        frame.paragraphs[0].text = ""
        write_paragraph(frame.paragraphs[0], text, body_size, color, bold=bold)

    for col, header in enumerate(item.headers):
        style(table.cell(0, col), header, bold=True, color=TEXT, fill=HEADER_FILL)
    for row_index, row in enumerate(item.rows, start=1):
        fill = PANEL if row_index % 2 else BG
        for col, value in enumerate(row):
            style(table.cell(row_index, col), value, bold=col == 0, color=TEXT, fill=fill)


def pptx_closing(slide, item: Slide) -> None:
    frame = add_textbox(slide, 0.9, 1.5, 11.5, 1.4, anchor=MSO_ANCHOR.BOTTOM)
    write_paragraph(frame.paragraphs[0], item.title, 48, TEXT, bold=True, align=PP_ALIGN.CENTER)
    frame = add_textbox(slide, 1.0, 3.1, 11.3, 0.8)
    write_paragraph(frame.paragraphs[0], item.subtitle, 24, ACCENT, align=PP_ALIGN.CENTER)
    if item.items:
        frame = add_textbox(slide, 1.0, 4.2, 11.3, 2.2)
        for idx, it in enumerate(item.items):
            p = frame.paragraphs[0] if idx == 0 else frame.add_paragraph()
            color = TEXT if idx < 2 else MUTED
            write_paragraph(p, it, 18, color, align=PP_ALIGN.CENTER, space_after=12)


def build_pptx(slides: tuple[Slide, ...]) -> None:
    prs = Presentation()
    prs.slide_width = Inches(SLIDE_W_IN)
    prs.slide_height = Inches(SLIDE_H_IN)
    blank = prs.slide_layouts[6]
    for number, item in enumerate(slides, start=1):
        slide = prs.slides.add_slide(blank)
        pptx_background(slide)
        if item.kind == "cover":
            pptx_cover(slide, item)
        elif item.kind == "closing":
            pptx_closing(slide, item)
        else:
            pptx_title(slide, item.title)
            pptx_footer(slide, number)
            if item.kind == "bullets":
                pptx_bullets(slide, item)
            elif item.kind == "cards":
                pptx_cards(slide, item)
                if item.note:
                    pptx_note(slide, item.note, y=6.35)
            elif item.kind == "table":
                pptx_table(slide, item)
                if item.note:
                    pptx_note(slide, item.note, y=6.35)
    prs.save(PPTX_PATH)


# ---------------------------------------------------------------- HTML (fonte do PDF)

HTML_CSS = f"""
@page {{ size: {SLIDE_W_IN}in {SLIDE_H_IN}in; margin: 0; }}
* {{ box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
body {{ margin: 0; background: #{BG}; color: #{TEXT}; font-family: {FONT}, Arial, sans-serif; }}
.slide {{ position: relative; width: {SLIDE_W_IN}in; height: {SLIDE_H_IN}in; overflow: hidden;
          padding: 0.4in 0.6in; background: #{BG}; page-break-after: always; }}
.slide:last-child {{ page-break-after: auto; }}
h1 {{ font-size: 32pt; margin: 0; padding-bottom: 0.1in; font-weight: 700; }}
.bar {{ width: 1.2in; height: 0.06in; background: #{ACCENT}; margin-bottom: 0.3in; }}
.bullets p {{ font-size: 21pt; margin: 0 0 16pt 0; line-height: 1.35; }}
.cards {{ display: grid; grid-template-columns: repeat(3, 3.83in); gap: 0.3in; margin-top: 0.1in; }}
.card {{ background: #{PANEL}; height: 3.8in; padding: 0.25in 0.22in; }}
.card h2 {{ font-size: 22pt; color: #{ACCENT}; margin: 0 0 12pt 0; }}
.card p {{ font-size: 17pt; margin: 0; line-height: 1.35; }}
table {{ width: 100%; border-collapse: collapse; table-layout: fixed; }}
th, td {{ font-size: 14pt; text-align: left; vertical-align: middle; padding: 6pt 9pt; line-height: 1.35; }}
th {{ background: #{HEADER_FILL}; font-weight: 700; }}
td:first-child {{ font-weight: 700; }}
tbody tr:nth-child(odd) td {{ background: #{PANEL}; }}
tbody tr:nth-child(even) td {{ background: #{BG}; }}
.note {{ position: absolute; left: 0.6in; right: 0.6in; top: 6.35in; font-size: 14pt; color: #{WARN}; margin: 0; }}
.footer {{ position: absolute; left: 0.6in; right: 0.6in; bottom: 0.3in; font-size: 14pt; color: #{MUTED};
           display: flex; justify-content: space-between; }}
.cover {{ padding-top: 1.9in; }}
.cover h1 {{ font-size: 60pt; }}
.cover .sub {{ font-size: 28pt; color: #{ACCENT}; margin: 0.3in 0 0.2in 0; }}
.cover .meta {{ font-size: 18pt; color: #{MUTED}; margin: 0; }}
.closing {{ display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding-top: 1.5in; }}
.closing h1 {{ font-size: 48pt; margin: 0 0 0.1in 0; }}
.closing .sub {{ font-size: 24pt; color: #{ACCENT}; max-width: 10.3in; margin: 0 0 0.35in 0; }}
.closing-items {{ max-width: 10.5in; }}
.closing-item {{ font-size: 18pt; color: #{TEXT}; margin: 0 0 12pt 0; line-height: 1.4; }}
.closing-item:last-child {{ font-size: 15pt; color: #{MUTED}; margin-top: 16pt; }}
"""


def html_cell(text: str) -> str:
    return html.escape(text)


def html_slide(number: int, item: Slide) -> str:
    if item.kind == "cover":
        return (
            f'<section class="slide cover"><h1>{html_cell(item.title)}</h1>'
            f'<p class="sub">{html_cell(item.subtitle)}</p>'
            f'<p class="meta">{html_cell(item.note)}</p></section>'
        )
    if item.kind == "closing":
        items_html = "".join(f'<p class="closing-item">{html_cell(it)}</p>' for it in item.items) if item.items else ""
        return (
            f'<section class="slide closing"><h1>{html_cell(item.title)}</h1>'
            f'<p class="sub">{html_cell(item.subtitle)}</p>'
            f'<div class="closing-items">{items_html}</div></section>'
        )

    parts = [f'<section class="slide">', f"<h1>{html_cell(item.title)}</h1>", '<div class="bar"></div>']
    if item.kind == "bullets":
        parts.append('<div class="bullets">')
        parts.extend(f"<p>\u2022&nbsp;&nbsp;{html_cell(text)}</p>" for text in item.items)
        parts.append("</div>")
    elif item.kind == "cards":
        parts.append('<div class="cards">')
        parts.extend(
            f'<div class="card"><h2>{html_cell(head)}</h2><p>{html_cell(body)}</p></div>'
            for head, body in item.cards
        )
        parts.append("</div>")
    elif item.kind == "table":
        total = sum(item.widths)
        cols = "".join(f'<col style="width:{width / total * 100:.2f}%">' for width in item.widths)
        head = "".join(f"<th>{html_cell(header)}</th>" for header in item.headers)
        body = "".join(
            "<tr>" + "".join(f"<td>{html_cell(value)}</td>" for value in row) + "</tr>"
            for row in item.rows
        )
        parts.append(f"<table><colgroup>{cols}</colgroup><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>")
    if item.note:
        parts.append(f'<p class="note">{html_cell(item.note)}</p>')
    parts.append(f'<div class="footer"><span>CrewVitals | Demonstracao Operacional</span><span>{number}</span></div>')
    parts.append("</section>")
    return "".join(parts)


def build_html(slides: tuple[Slide, ...]) -> str:
    sections = "\n".join(html_slide(number, item) for number, item in enumerate(slides, start=1))
    return (
        "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n"
        "<title>CrewVitals - Demo</title>\n"
        f"<style>{HTML_CSS}</style>\n</head>\n<body>\n{sections}\n</body>\n</html>\n"
    )


# ---------------------------------------------------------------- PDF

def find_chrome() -> str:
    candidates = [os.environ.get("CHROME_PATH", ""), *CHROME_CANDIDATES]
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return candidate
    found = shutil.which("chrome") or shutil.which("msedge")
    if found:
        return found
    raise FileNotFoundError("Chrome ou Edge nao encontrado. Defina CHROME_PATH.")


def export_pdf(html_text: str) -> None:
    chrome = find_chrome()
    with tempfile.TemporaryDirectory() as temp_dir:
        html_file = Path(temp_dir) / "CrewVitals-Demo.html"
        html_file.write_text(html_text, encoding="utf-8")
        subprocess.run(
            [
                chrome,
                "--headless=new",
                "--disable-gpu",
                "--no-pdf-header-footer",
                f"--print-to-pdf={PDF_PATH}",
                html_file.as_uri(),
            ],
            check=True,
            timeout=180,
        )


def main() -> None:
    build_pptx(SLIDES)
    export_pdf(build_html(SLIDES))
    print(f"PPTX: {PPTX_PATH}")
    print(f"PDF:  {PDF_PATH}")
    print(f"Slides: {len(SLIDES)}")


if __name__ == "__main__":
    main()
