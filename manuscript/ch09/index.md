---
id: "ch09"
chapter: 9
order: 0
title: "9장. 아키텍처"
status: "reviewed"
verification: "partial"
page_target: 7
keywords: ["아키텍처", "시스템 설계", "MSA", "확장성"]
source_refs: ["https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/", "https://microservices.io/", "https://www.ibm.com/topics/software-architecture"]
crosslinks: ["section-01.md", "section-02.md", "section-04.md"]
---


# 9장. 아키텍처

5장에서 소프트웨어 아키텍처가 무엇인지 개괄적으로 보았다면, 9장은 그 구조 감각을 시스템 수준으로 끌어올리는 장입니다. 서비스가 커질수록 기능 하나를 잘 만드는 것만으로는 충분하지 않습니다. 어떤 부분을 나누고, 어떻게 연결하고, 장애가 나면 어디까지 번지지 않게 막을지 같은 구조적 선택이 전체 품질을 좌우합니다.

초보자는 아키텍처를 거대한 설계도나 전문가 전용 그림으로 생각하기 쉽습니다. 하지만 실제로는 앞으로 변경이 잦은 부분과 안정적으로 유지할 부분을 구분하고, 역할을 분리해 시스템이 오래 버티게 하는 판단의 모음입니다. 즉, 아키텍처는 멋진 그림보다 좋은 경계와 책임 배분에 더 가깝습니다.

이 장에서는 시스템 아키텍처가 무엇인지, 왜 중요한지, 일상 비유로 보면 어떤 감각인지, 그리고 MSA가 왜 자주 언급되는지를 차례로 설명합니다. 목적은 특정 유행을 찬양하는 것이 아니라, 구조 선택이 왜 개발의 핵심 주제인지 이해하는 데 있습니다.
