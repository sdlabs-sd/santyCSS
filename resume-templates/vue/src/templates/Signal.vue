<script setup>
import { dateRange, levelWidth } from '@shared/format.js';
import { A, Avatar, contacts, has, templateProps, useResume } from './parts.js';

/** Signal — Data Scientist. Metric tiles + proficiency bars, dashboard feel. */
const props = defineProps(templateProps);
const { basics, experience, education, skills, projects, certifications, languages, links, stats } = useResume(props);
</script>

<template>
  <main class="font-sans min-height-screen background-gray-100 add-padding-y-40 add-padding-x-16 on-mobile:add-padding-y-16">
    <div class="max-width-1024 center-margin">
      <header :class="'round-corners-20 add-padding-32 on-mobile:add-padding-24 color-white make-flex flex-wrap align-center gap-24 ' + accent.deep">
        <Avatar :basics="basics" class="set-width-80 set-height-80 make-circle add-border-4 border-color-white flex-shrink-0" :fallbackClass="'set-text-28 text-bold ' + accent.bar" />
        <div class="flex-1 min-width-240">
          <h1 class="set-text-36 on-mobile:set-text-28 text-extrabold line-height-tight">{{ basics.name }}</h1>
          <p :class="'set-text-17 add-margin-top-4 ' + accent.textLight">{{ basics.title }}</p>
        </div>
        <ul class="list-none add-padding-0 add-margin-0 set-text-14">
          <li v-for="c in contacts(basics)" :key="c.key" class="add-margin-bottom-4">
            <A :href="c.href" :class="'text-no-decoration on-hover:color-white ' + accent.textLight">{{ c.icon }} {{ c.label }}</A>
          </li>
        </ul>
      </header>

      <div v-if="has(stats)" class="make-grid grid-cols-2 md:grid-cols-4 gap-16 add-margin-top-16">
        <div v-for="s in stats" :key="s.label" class="background-white round-corners-16 add-border-1 border-color-gray-200 add-padding-20">
          <p class="set-text-12 text-semibold text-uppercase letter-space-wide color-gray-500">{{ s.label }}</p>
          <p :class="'set-text-32 text-extrabold add-margin-top-4 ' + accent.text">{{ s.value }}</p>
        </div>
      </div>

      <div class="make-grid grid-cols-1 md:grid-cols-3 gap-16 add-margin-top-16">
        <div class="make-flex flex-column gap-16">
          <section v-if="has(skills)" class="background-white round-corners-16 add-border-1 border-color-gray-200 add-padding-24 break-inside-avoid ">
            <h2 class="make-flex align-center gap-8 set-text-13 text-bold text-uppercase letter-space-wider color-gray-500 add-margin-bottom-16"><span :class="'set-width-8 set-height-8 round-corners-2 ' + accent.bar" />Proficiency</h2>
            <div v-for="s in skills" :key="s.name" class="add-margin-bottom-14">
              <div class="make-flex justify-between set-text-13 add-margin-bottom-6">
                <span class="text-semibold color-gray-800">{{ s.name }}</span>
                <span class="color-gray-500 font-mono">{{ s.level }}</span>
              </div>
              <div class="set-height-8 background-gray-100 make-pill overflow-hidden">
                <div :class="'set-height-8 make-pill ' + accent.bar + ' ' + levelWidth(s.level)" />
              </div>
            </div>
          </section>
          <section v-if="has(education)" class="background-white round-corners-16 add-border-1 border-color-gray-200 add-padding-24 break-inside-avoid ">
            <h2 class="make-flex align-center gap-8 set-text-13 text-bold text-uppercase letter-space-wider color-gray-500 add-margin-bottom-16"><span :class="'set-width-8 set-height-8 round-corners-2 ' + accent.bar" />Education</h2>
            <div v-for="(e, i) in education" :key="i" class="add-margin-bottom-12">
              <p class="set-text-14 text-bold color-gray-900">{{ e.degree }}</p>
              <p class="set-text-13 color-gray-600">{{ e.school }}</p>
              <p class="set-text-12 color-gray-500">{{ dateRange(e.start, e.end) }}{{ e.details ? ' · ' + e.details : '' }}</p>
            </div>
          </section>
          <section v-if="has(certifications) || has(languages) || has(links)" class="background-white round-corners-16 add-border-1 border-color-gray-200 add-padding-24 break-inside-avoid ">
            <h2 class="make-flex align-center gap-8 set-text-13 text-bold text-uppercase letter-space-wider color-gray-500 add-margin-bottom-16"><span :class="'set-width-8 set-height-8 round-corners-2 ' + accent.bar" />More</h2>
            <p v-for="(c, i) in certifications" :key="i" class="set-text-13 color-gray-700 add-margin-bottom-8"><span class="text-semibold">{{ c.name }}</span> · {{ c.year }}</p>
            <p v-if="has(languages)" class="set-text-13 color-gray-700 add-margin-top-8">{{ languages.map(l => l.name + ' (' + l.level + ')').join(', ') }}</p>
            <div class="make-flex flex-wrap gap-8 add-margin-top-12">
              <A v-for="l in links" :key="l.url" :href="l.url" :class="'set-text-12 text-semibold add-padding-x-10 add-padding-y-4 make-pill text-no-decoration ' + accent.soft + ' ' + accent.textStrong">{{ l.label }}</A>
            </div>
          </section>
        </div>

        <div class="md:span-col-2 make-flex flex-column gap-16">
          <section v-if="basics.summary" class="background-white round-corners-16 add-border-1 border-color-gray-200 add-padding-24 break-inside-avoid ">
            <h2 class="make-flex align-center gap-8 set-text-13 text-bold text-uppercase letter-space-wider color-gray-500 add-margin-bottom-16"><span :class="'set-width-8 set-height-8 round-corners-2 ' + accent.bar" />Summary</h2>
            <p class="set-text-15 color-gray-700 line-height-relaxed">{{ basics.summary }}</p>
          </section>
          <section v-if="has(experience)" class="background-white round-corners-16 add-border-1 border-color-gray-200 add-padding-24 break-inside-avoid ">
            <h2 class="make-flex align-center gap-8 set-text-13 text-bold text-uppercase letter-space-wider color-gray-500 add-margin-bottom-16"><span :class="'set-width-8 set-height-8 round-corners-2 ' + accent.bar" />Experience</h2>
            <div v-for="(x, i) in experience" :key="i" :class="'add-padding-bottom-20 add-margin-bottom-20 break-inside-avoid ' + (i < experience.length - 1 ? 'add-border-bottom-1 border-color-gray-100' : '')">
              <div class="make-flex flex-wrap justify-between gap-8">
                <h3 class="set-text-17 text-bold color-gray-900">{{ x.role }}</h3>
                <span :class="'set-text-12 text-semibold add-padding-x-10 add-padding-y-4 make-pill ' + accent.soft + ' ' + accent.textStrong">{{ dateRange(x.start, x.end) }}</span>
              </div>
              <p class="set-text-14 color-gray-500 add-margin-bottom-8">{{ x.company }}{{ x.location ? ' · ' + x.location : '' }}</p>
              <ul class="add-padding-left-20 set-text-14 color-gray-700 line-height-relaxed">
                <li v-for="(h, j) in x.highlights" :key="j" class="add-margin-bottom-4">{{ h }}</li>
              </ul>
            </div>
          </section>
          <section v-if="has(projects)" class="background-white round-corners-16 add-border-1 border-color-gray-200 add-padding-24 break-inside-avoid ">
            <h2 class="make-flex align-center gap-8 set-text-13 text-bold text-uppercase letter-space-wider color-gray-500 add-margin-bottom-16"><span :class="'set-width-8 set-height-8 round-corners-2 ' + accent.bar" />Projects</h2>
            <div v-for="(p, i) in projects" :key="i" class="add-margin-bottom-12">
              <A :href="p.url" :class="'set-text-15 text-bold text-no-decoration ' + accent.text">{{ p.name }}</A>
              <p class="set-text-14 color-gray-600">{{ p.description }}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>
