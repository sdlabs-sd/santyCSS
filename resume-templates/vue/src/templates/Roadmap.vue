<script setup>
import { dateRange, levelWidth } from '@shared/format.js';
import { A, Avatar, contacts, has, templateProps, useResume } from './parts.js';

/** Roadmap (premium) — Product Manager. Milestone timeline, outcome-first. */
const props = defineProps(templateProps);
const { basics, experience, education, skills, projects, certifications, languages, links, stats } = useResume(props);
</script>

<template>
  <main class="font-sans min-height-screen background-slate-50">
    <header :class="'position-relative overflow-hidden ' + accent.deep">
      <div class="max-width-1024 center-margin add-padding-x-24 add-padding-y-56 on-mobile:add-padding-y-40 make-flex flex-wrap align-center gap-32">
        <Avatar :basics="basics" class="set-width-120 set-height-120 round-corners-32 add-shadow-xl flex-shrink-0" :fallbackClass="'set-text-40 text-extrabold color-white ' + accent.bar" />
        <div class="flex-1 min-width-280 color-white">
          <h1 class="set-text-48 on-mobile:set-text-32 text-extrabold line-height-tight letter-space-tight">{{ basics.name }}</h1>
          <p :class="'set-text-20 add-margin-top-6 ' + accent.textLight">{{ basics.title }}</p>
          <div class="make-flex flex-wrap gap-8 add-margin-top-20">
            <A v-for="c in contacts(basics)" :key="c.key" :href="c.href" class="set-text-13 color-white text-no-decoration add-padding-x-12 add-padding-y-6 make-pill add-border-1 border-color-white on-hover:background-white on-hover:color-black transition-all">{{ c.icon }} {{ c.label }}</A>
            <A v-for="l in links" :key="l.url" :href="l.url" :class="'set-text-13 text-bold text-no-decoration add-padding-x-12 add-padding-y-6 make-pill background-white ' + accent.textStrong">{{ l.label }} ↗</A>
          </div>
        </div>
      </div>
    </header>

    <div class="max-width-1024 center-margin add-padding-x-24 add-padding-y-48 on-mobile:add-padding-y-32">
      <p v-if="basics.summary" class="set-text-18 color-slate-700 line-height-relaxed max-width-840 add-margin-bottom-40">{{ basics.summary }}</p>
      <div v-if="has(stats)" class="make-flex flex-wrap gap-16 add-margin-bottom-48">
        <div v-for="s in stats" :key="s.label" :class="'flex-1 min-width-180 background-white round-corners-16 add-padding-20 add-shadow-sm add-border-top-4 ' + accent.border">
          <p :class="'set-text-32 text-extrabold ' + accent.text">{{ s.value }}</p>
          <p class="set-text-13 text-semibold color-slate-500">{{ s.label }}</p>
        </div>
      </div>

      <div class="make-grid grid-cols-1 md:grid-cols-3 gap-48">
        <div class="md:span-col-2">
          <section v-if="has(experience)" class="add-margin-bottom-40">
            <h2 class="set-text-22 text-extrabold color-slate-900 letter-space-tight add-margin-bottom-20">Roadmap</h2>
            <ol class="list-none add-padding-0 add-margin-0">
              <li v-for="(x, i) in experience" :key="i" class="make-flex gap-20 break-inside-avoid">
                <div class="make-flex flex-column align-center flex-shrink-0">
                  <span :class="'make-flex align-center justify-center set-width-36 set-height-36 make-circle set-text-14 text-extrabold color-white ' + (i === 0 ? accent.solid : 'background-slate-400')">{{ experience.length - i }}</span>
                  <span v-if="i < experience.length - 1" class="flex-1 set-width-2 background-slate-200 add-margin-y-4" />
                </div>
                <div class="add-padding-bottom-32 flex-1">
                  <p :class="'set-text-12 text-bold text-uppercase letter-space-widest ' + accent.text">{{ dateRange(x.start, x.end) }}</p>
                  <h3 class="set-text-18 text-extrabold color-slate-900 add-margin-top-2">{{ x.role }}</h3>
                  <p class="set-text-14 color-slate-500 add-margin-bottom-10">{{ x.company }}{{ x.location ? ' · ' + x.location : '' }}</p>
                  <div class="background-white round-corners-12 add-padding-16 add-border-1 border-color-slate-200">
                    <p v-for="(h, j) in x.highlights" :key="j" class="make-flex gap-10 set-text-14 color-slate-700 line-height-relaxed add-margin-bottom-6">
                      <span :class="'text-extrabold flex-shrink-0 ' + accent.text">✓</span><span>{{ h }}</span>
                    </p>
                  </div>
                </div>
              </li>
            </ol>
          </section>
          <section v-if="has(projects)">
            <h2 class="set-text-22 text-extrabold color-slate-900 letter-space-tight add-margin-bottom-20">Launches</h2>
            <div class="make-grid grid-cols-1 md:grid-cols-2 gap-16">
              <div v-for="(p, i) in projects" :key="i" :class="'round-corners-16 add-padding-20 ' + accent.soft">
                <div class="make-flex flex-wrap gap-6 add-margin-bottom-8">
                  <span v-for="t in p.tags" :key="t" :class="'set-text-11 text-bold text-uppercase letter-space-wide add-padding-x-8 add-padding-y-2 make-pill background-white ' + accent.textStrong">{{ t }}</span>
                </div>
                <A :href="p.url" class="set-text-16 text-extrabold color-slate-900 text-no-decoration">{{ p.name }}</A>
                <p class="set-text-14 color-slate-600 add-margin-top-4">{{ p.description }}</p>
              </div>
            </div>
          </section>
        </div>
        <aside>
          <section v-if="has(skills)" class="background-white round-corners-16 add-padding-24 add-shadow-sm add-margin-bottom-24">
            <h2 class="set-text-16 text-extrabold color-slate-900 add-margin-bottom-16">Skills matrix</h2>
            <div v-for="s in skills" :key="s.name" class="add-margin-bottom-12">
              <p class="set-text-13 text-semibold color-slate-700 add-margin-bottom-4">{{ s.name }}</p>
              <div class="set-height-6 background-slate-100 make-pill">
                <div :class="'set-height-6 make-pill ' + accent.solid + ' ' + levelWidth(s.level)" />
              </div>
            </div>
          </section>
          <section v-if="has(education)" class="background-white round-corners-16 add-padding-24 add-shadow-sm add-margin-bottom-24">
            <h2 class="set-text-16 text-extrabold color-slate-900 add-margin-bottom-12">Education</h2>
            <div v-for="(e, i) in education" :key="i" class="add-margin-bottom-8">
              <p class="set-text-14 text-bold color-slate-900">{{ e.degree }}</p>
              <p class="set-text-13 color-slate-500">{{ e.school }} · {{ e.end }}</p>
            </div>
          </section>
          <section v-if="has(certifications) || has(languages)" class="background-white round-corners-16 add-padding-24 add-shadow-sm">
            <h2 class="set-text-16 text-extrabold color-slate-900 add-margin-bottom-12">Credentials</h2>
            <p v-for="(c, i) in certifications" :key="i" class="set-text-13 color-slate-700 add-margin-bottom-6">{{ c.name }} ({{ c.year }})</p>
            <p v-for="l in languages" :key="l.name" class="set-text-13 color-slate-700 add-margin-bottom-6">{{ l.name }} · {{ l.level }}</p>
          </section>
        </aside>
      </div>
    </div>
  </main>
</template>
