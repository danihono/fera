// Provas da turma (fora do design, embaixo do ranking): quem gerou compartilha, a sala toda estuda sem gastar geração.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SubjectIcon, type SubjectId } from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { ouvirProvasDaTurma, tirarProvaDaTurma, type ProvaDaTurma } from '@/data/nuvem';
import { estudarProvaDaTurma, provaImportada } from '@/data/provasTurma';
import { useApp } from '@/data/store';
import { shortDate } from '@/lib/dates';
import { usuarioAtual } from '@/lib/firebase';
import { colors, fonts, radius, sizes } from '@/theme';

const dataDe = (iso: string) => new Date(`${iso}T00:00:00`);

export function ProvasDaTurma({ codigo }: { codigo: string }) {
  useApp(); // re-renderiza quando a pessoa importa uma prova ("na sua lista")
  const [ao, setAo] = useState<{ codigo: string; provas: ProvaDaTurma[] } | null>(null);
  const [aberta, setAberta] = useState<ProvaDaTurma | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const eu = usuarioAtual()?.uid;

  useEffect(() => ouvirProvasDaTurma(codigo, (provas) => setAo({ codigo, provas })), [codigo]);
  const provas = ao?.codigo === codigo ? ao.provas : [];

  const estudar = async (p: ProvaDaTurma) => {
    try {
      await estudarProvaDaTurma(codigo, p);
      router.navigate('/');
    } catch {
      setAviso('Não deu pra trazer essa prova agora. Confere a internet e tenta de novo.');
    }
  };

  return (
    <View style={styles.bloco}>
      <Text style={styles.titulo}>Provas da turma</Text>
      {provas.length === 0 ? (
        <Text style={styles.vazio}>Gerou uma prova? No detalhe dela, toca em &quot;Compartilhar com a turma&quot;: a sala toda estuda junto, sem esperar a IA.</Text>
      ) : (
        <View style={styles.lista}>
          {provas.map((p, i) => {
            const minha = p.autor === eu;
            const naLista = !!provaImportada(codigo, p.id);
            return (
              <Pressable key={p.id} accessibilityRole="button" onPress={() => setAberta(p)} style={({ pressed }) => [styles.linha, i > 0 && styles.divisor, pressed && { opacity: 0.7 }]}>
                <View style={styles.icone}>
                  <SubjectIcon subject={p.icone as SubjectId} size={22} color={colors.red} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.materia}>{p.materia}</Text>
                  <Text style={styles.sub} numberOfLines={1}>
                    {p.topico} · {shortDate(dataDe(p.data)).toLowerCase()} · {minha ? 'sua' : `por ${p.autorNome}`}
                  </Text>
                </View>
                <View style={[styles.chip, (minha || naLista) && { backgroundColor: colors.successBg }]}>
                  <Text style={[styles.chipTexto, (minha || naLista) && { color: colors.successText }]}>{minha ? 'Sua' : naLista ? 'Na lista' : 'Estudar'}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {aberta &&
        (aberta.autor === eu ? (
          <InfoSheet
            mood="pensativo"
            title="Tirar da turma?"
            text={`A prova de ${aberta.materia} some da lista da turma. Quem já trouxe pra própria lista continua com ela.`}
            button="Tirar"
            variant="error"
            onConfirm={() => tirarProvaDaTurma(codigo, aberta.id).catch(() => setAviso('Não deu pra tirar agora.'))}
            secondary={{ label: 'Deixar' }}
            onClose={() => setAberta(null)}
          />
        ) : (
          <InfoSheet
            mood="forca"
            title={`Prova de ${aberta.materia}`}
            text={`${aberta.topico}, ${shortDate(dataDe(aberta.data)).toLowerCase()}. ${aberta.autorNome} já gerou: missões e materiais prontos, sem esperar a IA.`}
            button="Estudar essa"
            onConfirm={() => estudar(aberta)}
            secondary={{ label: 'Agora não' }}
            onClose={() => setAberta(null)}
          />
        ))}
      {aviso && <InfoSheet mood="pensativo" title="Opa!" text={aviso} button="Beleza" onClose={() => setAviso(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { marginTop: 26, gap: 10 },
  titulo: { fontFamily: fonts.nunito900, fontSize: 20, color: colors.text },
  vazio: { fontFamily: fonts.nunito700, fontSize: 15, lineHeight: 21, color: colors.textMuted },
  lista: { borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, paddingHorizontal: 14 },
  linha: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  divisor: { borderTopWidth: sizes.borderWidth, borderColor: colors.border },
  icone: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  materia: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  sub: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  chip: { height: 26, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.redSoft, justifyContent: 'center' },
  chipTexto: { fontFamily: fonts.nunito800, fontSize: 13, color: colors.redText },
});
